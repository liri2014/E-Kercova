import React, { useRef, useState, useEffect } from 'react';
import { Icon, Icons, Button } from './ui';

interface PhotoAnnotatorProps {
    photoUrl: string;
    onSave: (annotatedPhotoUrl: string) => void;
    onCancel: () => void;
}

type Tool = 'arrow' | 'circle' | 'freehand';
type Color = '#ef4444' | '#22c55e' | '#3b82f6' | '#f59e0b';

interface DrawingPoint {
    x: number;
    y: number;
}

interface Annotation {
    tool: Tool;
    color: Color;
    points: DrawingPoint[];
}

export const PhotoAnnotator: React.FC<PhotoAnnotatorProps> = ({ photoUrl, onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tool, setTool] = useState<Tool>('arrow');
    const [color, setColor] = useState<Color>('#ef4444');
    const [isDrawing, setIsDrawing] = useState(false);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const imageRef = useRef<HTMLImageElement | null>(null);

    // Load image and setup canvas
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            imageRef.current = img;
            setImageLoaded(true);
            redrawCanvas();
        };
        img.src = photoUrl;
    }, [photoUrl]);

    // Redraw canvas whenever annotations change
    useEffect(() => {
        if (imageLoaded) {
            redrawCanvas();
        }
    }, [annotations, imageLoaded]);

    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;
        
        if (!canvas || !ctx || !img) return;

        // Set canvas size to match container
        const container = containerRef.current;
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }

        // Draw image scaled to fit
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Draw all annotations
        annotations.forEach(annotation => {
            drawAnnotation(ctx, annotation);
        });

        // Draw current annotation if drawing
        if (currentAnnotation) {
            drawAnnotation(ctx, currentAnnotation);
        }
    };

    const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: Annotation) => {
        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const { tool, points } = annotation;

        if (points.length < 2) return;

        switch (tool) {
            case 'arrow':
                // Draw line
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
                ctx.stroke();

                // Draw arrowhead
                const lastPoint = points[points.length - 1];
                const secondLast = points[0];
                const angle = Math.atan2(lastPoint.y - secondLast.y, lastPoint.x - secondLast.x);
                const arrowLength = 15;
                
                ctx.beginPath();
                ctx.moveTo(lastPoint.x, lastPoint.y);
                ctx.lineTo(
                    lastPoint.x - arrowLength * Math.cos(angle - Math.PI / 6),
                    lastPoint.y - arrowLength * Math.sin(angle - Math.PI / 6)
                );
                ctx.moveTo(lastPoint.x, lastPoint.y);
                ctx.lineTo(
                    lastPoint.x - arrowLength * Math.cos(angle + Math.PI / 6),
                    lastPoint.y - arrowLength * Math.sin(angle + Math.PI / 6)
                );
                ctx.stroke();
                break;

            case 'circle':
                const centerX = (points[0].x + points[points.length - 1].x) / 2;
                const centerY = (points[0].y + points[points.length - 1].y) / 2;
                const radiusX = Math.abs(points[points.length - 1].x - points[0].x) / 2;
                const radiusY = Math.abs(points[points.length - 1].y - points[0].y) / 2;
                
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                ctx.stroke();
                break;

            case 'freehand':
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.forEach(point => {
                    ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
                break;
        }
    };

    const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent): DrawingPoint => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        let clientX: number, clientY: number;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const point = getCanvasCoordinates(e);
        setIsDrawing(true);
        setCurrentAnnotation({
            tool,
            color,
            points: [point],
        });
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !currentAnnotation) return;
        e.preventDefault();

        const point = getCanvasCoordinates(e);
        
        if (tool === 'freehand') {
            setCurrentAnnotation({
                ...currentAnnotation,
                points: [...currentAnnotation.points, point],
            });
        } else {
            // For arrow and circle, only keep start and end points
            setCurrentAnnotation({
                ...currentAnnotation,
                points: [currentAnnotation.points[0], point],
            });
        }

        redrawCanvas();
    };

    const handleEnd = () => {
        if (currentAnnotation && currentAnnotation.points.length >= 2) {
            setAnnotations([...annotations, currentAnnotation]);
        }
        setIsDrawing(false);
        setCurrentAnnotation(null);
    };

    const handleUndo = () => {
        setAnnotations(annotations.slice(0, -1));
    };

    const handleClear = () => {
        setAnnotations([]);
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onSave(dataUrl);
    };

    const tools: { id: Tool; icon: string; label: string }[] = [
        { id: 'arrow', icon: Icons.arrowLeft, label: 'Arrow' },
        { id: 'circle', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', label: 'Circle' },
        { id: 'freehand', icon: 'M3 17c3.333-3.333 5-5 5-5s1.667 1.667 5 5 5-5 5-5 1.667 1.667 5 5', label: 'Freehand' },
    ];

    const colors: Color[] = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b'];

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/80">
                <button onClick={onCancel} className="text-white p-2">
                    <Icon path={Icons.x} size={24} />
                </button>
                <span className="text-white font-medium">Annotate Photo</span>
                <button onClick={handleSave} className="text-indigo-400 font-semibold px-4 py-2">
                    Done
                </button>
            </div>

            {/* Canvas Container */}
            <div ref={containerRef} className="flex-1 relative overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full touch-none"
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                />
            </div>

            {/* Toolbar */}
            <div className="bg-slate-900 p-4 space-y-4">
                {/* Tools */}
                <div className="flex items-center justify-center gap-2">
                    {tools.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTool(t.id)}
                            className={`p-3 rounded-xl transition-colors ${
                                tool === t.id 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            <Icon path={t.icon} size={24} />
                        </button>
                    ))}
                    <div className="w-px h-8 bg-slate-700 mx-2" />
                    <button
                        onClick={handleUndo}
                        disabled={annotations.length === 0}
                        className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-50"
                    >
                        <Icon path={Icons.history} size={24} />
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={annotations.length === 0}
                        className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-50"
                    >
                        <Icon path={Icons.x} size={24} />
                    </button>
                </div>

                {/* Colors */}
                <div className="flex items-center justify-center gap-3">
                    {colors.map(c => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full transition-transform ${
                                color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                            }`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PhotoAnnotator;

