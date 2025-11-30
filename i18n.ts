
import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'mk' | 'sq';

const translations = {
  en: {
    // Onboarding
    geolocation_not_supported: 'Geolocation is not supported by your browser.',
    next: 'Next',
    back: 'Back',

    // Verification
    verify_account: 'Verify Your Account',
    verification_description: "We'll send a one-time verification code to your phone number.",
    phone_number: 'Phone Number',
    phone_placeholder: '071234567',
    send_code: 'Send Code',
    enter_code_prompt: 'Enter the 6-digit code we sent to',
    verification_code: 'Verification Code',
    verify: 'Verify',
    change_number: 'Change number',
    error_phone_invalid: 'Please enter a valid Macedonian phone number (e.g., 071234567).',
    error_code_invalid: 'Verification code must be 6 digits.',
    error_code_mismatch: 'The verification code is incorrect. Please try again.',
    demo_code_notice: 'For demonstration, your code is',
    code_sent: 'Verification code sent! Check your phone.',

    // Header
    app_title: 'E-Kicevo',

    // Dashboard
    good_morning: 'Good morning',
    good_afternoon: 'Good afternoon',
    good_evening: 'Good evening',
    how_can_we_help: 'How can we help you today?',
    report_new_issue: 'Report an Issue',
    services: 'Services',
    property_taxes: 'Property & Taxes',
    general_settings: 'General Settings',
    parking: 'Parking',
    events: 'Events',
    news: 'News & Alerts',
    view_all: 'View All',
    wallet: 'Wallet',
    balance: 'Balance',
    report_history: 'Report History',
    map_view: 'Map View',
    content_coming_soon: 'Content coming soon',

    // Settings
    settings: 'Settings',
    language: 'Language',
    appearance: 'Appearance',
    theme_toggle_light: 'Switch to Light Mode',
    theme_toggle_dark: 'Switch to Dark Mode',
    settings_desc: 'More settings will be available here in the future.',

    // Wallet
    current_balance: 'Current Balance',
    add_funds: 'Add Funds',
    amount_to_add: 'Amount to Add',
    add_funds_cta: 'Add {amount} MKD to Balance',
    add: 'Add',
    valid_thru: 'VALID THRU',

    // Parking
    total: 'Total',
    total_cost: 'Total Cost',
    select_zone: 'Select Zone',
    duration: 'Duration',
    parking_zones: 'Parking Zones',
    zone: 'Zone',
    occupied: 'Occupied',
    free: 'Free',
    pay_for_parking: 'Pay for Parking',
    license_plate: 'License Plate',
    plate_placeholder: 'SK-1234-AB',
    pay_for_hour: 'Pay for 1 Hour',
    per_hour: 'MKD/hr',
    recent_transactions: 'Recent Transactions',
    no_transactions: 'No transactions yet.',
    location_acquired: "Location Acquired",
    fetching_location: "Fetching Location...",
    please_wait_gps: "Please wait while we get your GPS coordinates.",
    error_insufficient_funds: 'Insufficient funds.',
    error_enter_plate: 'Please enter a license plate.',
    payment_successful: 'Payment successful!',
    hours: 'Hours',
    hours_short: 'hrs',
    pay_for_duration: 'Pay for {hours}h ({totalCost} MKD)',
    transaction_duration: 'Duration: {hours}h',

    // Events & Calendar
    events_for: 'Events for',
    prev_month: 'Previous month',
    next_month: 'Next month',
    month_0: 'January', month_1: 'February', month_2: 'March', month_3: 'April',
    month_4: 'May', month_5: 'June', month_6: 'July', month_7: 'August',
    month_8: 'September', month_9: 'October', month_10: 'November', month_11: 'December',
    day_0: 'Sun', day_1: 'Mon', day_2: 'Tue', day_3: 'Wed', day_4: 'Thu', day_5: 'Fri', day_6: 'Sat',
    municipality_event: 'Municipality Event',
    national_holiday: 'National Holiday',
    no_events_today: 'No events scheduled for this day.',
    holiday_new_year: "New Year's Day",
    holiday_new_year_2: "New Year's Holiday",
    holiday_orthodox_christmas: 'Orthodox Christmas',
    holiday_labour_day: 'Labour Day',
    holiday_ramadan: 'Ramazan Bajram',
    holiday_orthodox_good_friday: 'Orthodox Good Friday',
    holiday_orthodox_easter: 'Orthodox Easter Monday',
    holiday_cyril_methodius: 'Saints Cyril and Methodius Day',
    holiday_republic_day: 'Republic Day (Ilinden)',
    holiday_independence_day: 'Independence Day',
    holiday_uprising_day: "Day of People's Uprising",
    holiday_revolutionary_struggle: 'Day of the Macedonian Revolutionary Struggle',
    holiday_all_saints: "All Saints' Day",
    holiday_clement_ohrid: 'Saint Clement of Ohrid Day',
    event_cleanup: 'City Park Cleanup',
    event_music_festival: 'Summer Music Festival',
    event_town_hall: 'Town Hall Meeting',

    // News
    news_and_alerts: 'News & Alerts',
    Upcoming: 'Upcoming',
    Ongoing: 'Ongoing',
    Completed: 'Completed',
    news_construction_title: 'Road reconstruction on "Partizanska" St.',
    news_construction_desc: 'The main street "Partizanska" will be closed for reconstruction. Please use alternative routes.',
    news_water_outage_title: 'Water outage in "Centar" neighborhood',
    news_water_outage_desc: 'Due to planned maintenance, there will be a temporary water outage from 9 AM to 3 PM.',
    news_public_notice_title: 'Public survey on new park design',
    news_public_notice_desc: 'Citizens are invited to participate in a survey for the new central park design.',

    // Report
    submit_new_report: 'Submit New Report',
    photo_evidence: 'Photo Evidence',
    add_photo_prompt: 'Add a photo of the issue using your camera or gallery.',
    take_photo: 'Take Photo',
    tap_to_take_photo: 'Tap to take photo',
    choose_from_gallery: 'Choose from Gallery',
    change_photo: 'Change Photo',
    use_camera_gallery: 'Use your camera or gallery',
    location: 'Location',
    location_acquiring: 'Acquiring GPS signal...',
    location_error: 'Please enable location access in your browser settings.',
    brief_description: 'Brief Description',
    description_placeholder: 'e.g., Large pothole on Main St.',
    title: 'Title',
    category: 'Category',
    analyzing: 'Analyzing...',
    submitting: 'Submitting...',
    submit_report: 'Submit Report',
    report_submitted: 'Report Submitted!',
    report_submitted_desc: 'Thank you for your contribution to our community.',
    back_to_dashboard: 'Back to Dashboard',
    error_required_fields: 'Photo and location are required.',
    error_ai_analysis: 'AI analysis failed. Please fill details manually.',
    report_summary_title: 'Report Summary',
    submitted_title: 'Title',
    submitted_category: 'Category',
    submitted_location: 'Location',
    confirm_submission_title: 'Confirm Submission',
    confirm_submission_body: 'Are you sure you want to submit this report?',
    confirm_submit: 'Confirm Submit',
    cancel: 'Cancel',
    no_reports_yet: 'No reports have been submitted yet.',
    no_reports_map: 'No reports have been submitted yet. When they are, they will appear here.',
    map_of_reports: 'Map of Reports',
    preview: 'Preview',
    add_photo: 'Add Photo',
    loading: 'Loading...',
    rate: 'Rate',
    duration_hours: 'Duration (Hours)',
    pay_now: 'Pay Now',

    // Categories
    Pothole: 'Pothole',
    Garbage: 'Garbage',
    Streetlight: 'Streetlight',
    Graffiti: 'Graffiti',
    'Damaged Sign': 'Damaged Sign',
    'Park Maintenance': 'Park Maintenance',
    Other: 'Other',



    // Tutorial
    skip_tutorial: "Skip",
    finish_tutorial: "Finish",
    tutorial_report_title: "Report an Issue",
    tutorial_report_desc: "Tap here to report problems like potholes or broken streetlights. Your photo and location help us fix things faster.",
    tutorial_parking_title: "Pay for Parking",
    tutorial_parking_desc: "Easily manage and pay for parking in different city zones directly from the app.",
    tutorial_wallet_title: "Your Digital Wallet",
    tutorial_wallet_desc: "This is your balance. Add funds here to pay for parking and other services seamlessly.",
    get_directions: "Get Directions",
    report_details: "Report Details",
    no_photo: "No Photo",
  },
  mk: {
    // Onboarding
    geolocation_not_supported: 'Геолокацијата не е поддржана од вашиот прелистувач.',
    next: 'Следно',
    back: 'Назад',

    // Verification
    verify_account: 'Потврдете ја вашата сметка',
    verification_description: 'Ќе ви испратиме еднократен код за верификација на вашиот телефонски број.',
    phone_number: 'Телефонски број',
    phone_placeholder: '071234567',
    send_code: 'Испрати код',
    enter_code_prompt: 'Внесете го 6-цифрениот код што го испративме на',
    verification_code: 'Код за верификација',
    verify: 'Потврди',
    change_number: 'Промени број',
    error_phone_invalid: 'Ве молиме внесете валиден македонски телефонски број (пр. 071234567).',
    error_code_invalid: 'Кодот за верификација мора да има 6 цифри.',
    error_code_mismatch: 'Кодот за верификација е неточен. Ве молиме обидете се повторно.',
    demo_code_notice: 'За демонстрација, вашиот код е',
    code_sent: 'Кодот за верификација е испратен! Проверете го вашиот телефон.',

    // Header
    app_title: 'Е-Кичево',

    // Dashboard
    good_morning: 'Добро утро',
    good_afternoon: 'Добар ден',
    good_evening: 'Добра вечер',
    how_can_we_help: 'Како можеме да ви помогнеме денес?',
    report_new_issue: 'Пријави проблем',
    services: 'Услуги',
    property_taxes: 'Имот и даноци',
    general_settings: 'Општи поставки',
    parking: 'Паркинг',
    events: 'Настани',
    news: 'Вести и известувања',
    view_all: 'Види ги сите',
    wallet: 'Паричник',
    balance: 'Салдо',
    report_history: 'Историја на пријави',
    map_view: 'Карта',
    content_coming_soon: 'Содржината наскоро',

    // Settings
    settings: 'Поставки',
    language: 'Јазик',
    appearance: 'Изглед',
    theme_toggle_light: 'Вклучи светол режим',
    theme_toggle_dark: 'Вклучи темен режим',
    settings_desc: 'Повеќе поставки ќе бидат достапни тука во иднина.',

    // Wallet
    current_balance: 'Моментално салдо',
    add_funds: 'Додади средства',
    amount_to_add: 'Износ за додавање',
    add_funds_cta: 'Додади {amount} МКД на салдо',
    add: 'Додади',
    valid_thru: 'ВАЖИ ДО',

    // Parking
    total: 'Вкупно',
    total_cost: 'Вкупен износ',
    select_zone: 'Избери зона',
    duration: 'Времетраење',
    parking_zones: 'Паркинг зони',
    zone: 'Зона',
    occupied: 'Зафатени',
    free: 'Слободни',
    pay_for_parking: 'Плати за паркинг',
    license_plate: 'Регистарска табличка',
    plate_placeholder: 'СК-1234-АБ',
    pay_for_hour: 'Плати за 1 час',
    per_hour: 'МКД/час',
    recent_transactions: 'Скорешни трансакции',
    no_transactions: 'Нема трансакции.',
    error_insufficient_funds: 'Недоволно средства.',
    error_enter_plate: 'Ве молиме внесете регистарска табличка.',
    payment_successful: 'Плаќањето е успешно!',
    hours: 'Часови',
    hours_short: 'ч',
    pay_for_duration: 'Плати за {hours}ч ({totalCost} МКД)',
    transaction_duration: 'Времетраење: {hours}ч',

    // Events & Calendar
    events_for: 'Настани за',
    prev_month: 'Претходен месец',
    next_month: 'Следен месец',
    month_0: 'Јануари', month_1: 'Февруари', month_2: 'Март', month_3: 'Април',
    month_4: 'Мај', month_5: 'Јуни', month_6: 'Јули', month_7: 'Август',
    month_8: 'Септември', month_9: 'Октомври', month_10: 'Ноември', month_11: 'Декември',
    day_0: 'Не', day_1: 'По', day_2: 'Вт', day_3: 'Ср', day_4: 'Че', day_5: 'Пе', day_6: 'Са',
    municipality_event: 'Општински настан',
    national_holiday: 'Државен празник',
    no_events_today: 'Нема закажани настани за овој ден.',
    holiday_new_year: 'Нова Година',
    holiday_new_year_2: 'Новогодишен празник',
    holiday_orthodox_christmas: 'Православен Божиќ',
    holiday_labour_day: 'Ден на трудот',
    holiday_ramadan: 'Рамазан Бајрам',
    holiday_orthodox_good_friday: 'Велики Петок',
    holiday_orthodox_easter: 'Православен Велигден',
    holiday_cyril_methodius: 'Ден на Свети Кирил и Методиј',
    holiday_republic_day: 'Ден на Републиката (Илинден)',
    holiday_independence_day: 'Ден на независноста',
    holiday_uprising_day: 'Ден на народното востание',
    holiday_revolutionary_struggle: 'Ден на македонската револуционерна борба',
    holiday_all_saints: 'Сите Светци',
    holiday_clement_ohrid: 'Ден на Свети Климент Охридски',
    event_cleanup: 'Чистење на градскиот парк',
    event_music_festival: 'Летен музички фестивал',
    event_town_hall: 'Состанок во општина',

    // News
    news_and_alerts: 'Вести и известувања',
    Upcoming: 'Претстои',
    Ongoing: 'Во тек',
    Completed: 'Завршено',
    news_construction_title: 'Реконструкција на ул. „Партизанска“',
    news_construction_desc: 'Главната улица „Партизанска“ ќе биде затворена за реконструкција. Ве молиме користете алтернативни правци.',
    news_water_outage_title: 'Прекин на водоснабдување во населба „Центар“',
    news_water_outage_desc: 'Поради планирано одржување, ќе има привремен прекин на водоснабдувањето од 9 до 15 часот.',
    news_public_notice_title: 'Јавна анкета за нов дизајн на парк',
    news_public_notice_desc: 'Граѓаните се поканети да учествуваат во анкета за новиот дизајн на централниот парк.',

    // Report
    submit_new_report: 'Поднеси нова пријава',
    photo_evidence: 'Фото-доказ',
    add_photo_prompt: 'Додадете фотографија од проблемот користејќи ја вашата камера или галерија.',
    take_photo: 'Сликни фотографија',
    tap_to_take_photo: 'Допрете за да сликате',
    choose_from_gallery: 'Избери од галерија',
    change_photo: 'Промени фотографија',
    use_camera_gallery: 'Користете ја камерата или галеријата',
    location: 'Локација',
    location_acquiring: 'Се добива ГПС сигнал...',
    location_error: 'Ве молиме овозможете пристап до локацијата во поставките на прелистувачот.',
    brief_description: 'Краток опис',
    description_placeholder: 'пр. Голема дупка на главната улица.',
    title: 'Наслов',
    category: 'Категорија',
    analyzing: 'Се анализира...',
    submitting: 'Се поднесува...',
    submit_report: 'Поднеси пријава',
    report_submitted: 'Пријавата е поднесена!',
    report_submitted_desc: 'Ви благодариме за вашиот придонес во нашата заедница.',
    back_to_dashboard: 'Назад на почетна',
    error_required_fields: 'Фотографија и локација се задолжителни.',
    error_ai_analysis: 'Анализата со ВИ не успеа. Ве молиме пополнете ги деталите рачно.',
    report_summary_title: 'Резиме на пријавата',
    submitted_title: 'Наслов',
    submitted_category: 'Категорија',
    submitted_location: 'Локација',
    confirm_submission_title: 'Потврди поднесување',
    confirm_submission_body: 'Дали сте сигурни дека сакате да ја поднесете оваа пријава?',
    confirm_submit: 'Потврди',
    cancel: 'Откажи',
    no_reports_yet: 'Сè уште нема поднесени пријави.',
    no_reports_map: 'Сеуште нема поднесено пријави. Кога ќе има, ќе се појават тука.',
    map_of_reports: 'Карта на пријави',
    preview: 'Преглед',
    add_photo: 'Додади фотографија',
    loading: 'Се вчитува...',
    rate: 'Тарифа',
    duration_hours: 'Времетраење (Часови)',
    pay_now: 'Плати сега',

    // Categories
    Pothole: 'Дупка',
    Garbage: 'Ѓубре',
    Streetlight: 'Улично светло',
    Graffiti: 'Графити',
    'Damaged Sign': 'Оштетен знак',
    'Park Maintenance': 'Одржување на парк',
    Other: 'Друго',


    // Onboarding Tutorial
    skip: 'Прескокни',
    get_started: 'Започни',
    onboarding_welcome_title: 'Добредојдовте во Е-Кичево',
    onboarding_welcome_text: 'Вашите општински услуги на едно место',
    onboarding_report_title: 'Пријави проблеми',
    onboarding_report_text: 'Сликајте и пријавете општински проблеми моментално. Помогнете го нашиот град да биде подобар!',
    onboarding_parking_title: 'Брзо паркирање',
    onboarding_parking_text: 'Плаќајте за паркинг лесно од вашиот телефон. Нема повеќе барање паркомати!',
    onboarding_events_title: 'Бидете информирани',
    onboarding_events_text: 'Проверете настани, вести и откријте локални атракции на едно место',
    onboarding_done_title: "Подготвени сте!",
    onboarding_done_text: 'Подготвени сте да ги истражите сите функции и да ги искористите нашите услуги',


    // Tutorial
    skip_tutorial: "Прескокни",
    finish_tutorial: "Заврши",
    tutorial_report_title: "Пријави проблем",
    tutorial_report_desc: "Допрете тука за да пријавите проблеми како дупки или расипани улични светла. Вашата фотографија и локација ни помагаат да ги поправиме работите побрзо.",
    tutorial_parking_title: "Плати за паркинг",
    tutorial_parking_desc: "Лесно управувајте и плаќајте за паркинг во различни градски зони директно од апликацијата.",
    tutorial_wallet_title: "Вашиот дигитален паричник",
    tutorial_wallet_desc: "Ова е вашето салдо. Додадете средства тука за непречено плаќање на паркинг и други услуги.",
    get_directions: "Насоки до локација",
    report_details: "Детали за пријавата",
    no_photo: "Нема фотографија",
    location_acquired: "Локација добиена",
    fetching_location: "Се добива локација...",
    please_wait_gps: "Ве молиме почекајте додека ги добиваме вашите GPS координати.",
  },
  sq: {
    // Onboarding
    geolocation_not_supported: 'Gjeolokacioni nuk mbështetet nga shfletuesi juaj.',
    next: 'Tjetra',
    back: 'Prapa',

    // Verification
    verify_account: 'Verifiko Llogarinë Tënde',
    verification_description: 'Do të dërgojmë një kod verifikimi njëpërdorimësh në numrin tënd të telefonit.',
    phone_number: 'Numri i telefonit',
    phone_placeholder: '071234567',
    send_code: 'Dërgo Kodin',
    enter_code_prompt: 'Vendosni kodin 6-shifror që dërguam në',
    verification_code: 'Kodi i verifikimit',
    verify: 'Verifiko',
    change_number: 'Ndrysho numrin',
    error_phone_invalid: 'Ju lutemi vendosni një numër telefoni të vlefshëm maqedonas (p.sh., 071234567).',
    error_code_invalid: 'Kodi i verifikimit duhet të jetë 6 shifra.',
    error_code_mismatch: 'Kodi i verifikimit është i pasaktë. Ju lutemi provoni përsëri.',
    demo_code_notice: 'Për demonstrim, kodi juaj është',
    code_sent: 'Kodi i verifikimit u dërgua! Kontrolloni telefonin tuaj.',

    // Header
    app_title: 'E-Kërçova',

    // Dashboard
    good_morning: 'Mirëmëngjes',
    good_afternoon: 'Mirëdita',
    good_evening: 'Mirëmbrëma',
    how_can_we_help: 'Si mund t\'ju ndihmojmë sot?',
    report_new_issue: 'Raporto një Problem',
    services: 'Shërbimet',
    property_taxes: 'Prona dhe Taksat',
    general_settings: 'Cilësimet e Përgjithshme',
    parking: 'Parking',
    events: 'Ngjarjet',
    news: 'Lajme & Njoftime',
    view_all: 'Shiko të gjitha',
    wallet: 'Portofoli',
    balance: 'Balansi',
    report_history: 'Historia e Raporteve',
    map_view: 'Harta',
    content_coming_soon: 'Përmbajtja së shpejti',

    // Settings
    settings: 'Cilësimet',
    language: 'Gjuha',
    appearance: 'Pamja',
    theme_toggle_light: 'Kalo në Modalitetin e Dritës',
    theme_toggle_dark: 'Kalo në Modalitetin e Errët',
    settings_desc: 'Më shumë cilësime do të jenë të disponueshme këtu në të ardhmen.',

    // Wallet
    current_balance: 'Balansi Aktual',
    add_funds: 'Shto Fonde',
    amount_to_add: 'Shuma për të shtuar',
    add_funds_cta: 'Shto {amount} MKD në Balans',
    add: 'Shto',
    valid_thru: 'VLEN DERI',

    // Parking
    total: 'Totali',
    total_cost: 'Kostoja Totale',
    select_zone: 'Zgjidh Zonën',
    duration: 'Kohëzgjatja',
    parking_zones: 'Zonat e Parkingut',
    zone: 'Zona',
    occupied: 'Të zëna',
    free: 'Të lira',
    pay_for_parking: 'Paguaj për Parking',
    license_plate: 'Targa e Mjetit',
    plate_placeholder: 'SK-1234-AB',
    pay_for_hour: 'Paguaj për 1 Orë',
    per_hour: 'MKD/orë',
    recent_transactions: 'Transaksionet e Fundit',
    no_transactions: 'Nuk ka ende transaksione.',
    error_insufficient_funds: 'Fonde të pamjaftueshme.',
    error_enter_plate: 'Ju lutemi vendosni targën e mjetit.',
    payment_successful: 'Pagesa u krye me sukses!',
    hours: 'Orë',
    hours_short: 'orë',
    pay_for_duration: 'Paguaj për {hours}h ({totalCost} MKD)',
    transaction_duration: 'Kohëzgjatja: {hours}h',

    // Events & Calendar
    events_for: 'Ngjarjet për',
    prev_month: 'Muaji i kaluar',
    next_month: 'Muaji i ardhshëm',
    month_0: 'Janar', month_1: 'Shkurt', month_2: 'Mars', month_3: 'Prill',
    month_4: 'Maj', month_5: 'Qershor', month_6: 'Korrik', month_7: 'Gusht',
    month_8: 'Shtator', month_9: 'Tetor', month_10: 'Nëntor', month_11: 'Dhjetor',
    day_0: 'Die', day_1: 'Hën', day_2: 'Mar', day_3: 'Mër', day_4: 'Enj', day_5: 'Pre', day_6: 'Sht',
    municipality_event: 'Ngjarje Komunale',
    national_holiday: 'Festë Kombëtare',
    no_events_today: 'Nuk ka ngjarje të planifikuara për këtë ditë.',
    holiday_new_year: 'Viti i Ri',
    holiday_new_year_2: 'Festa e Vitit të Ri',
    holiday_orthodox_christmas: 'Krishtlindjet Ortodokse',
    holiday_labour_day: 'Dita e Punëtorëve',
    holiday_ramadan: 'Ramazan Bajrami',
    holiday_orthodox_good_friday: 'E Premtja e Mirë Ortodokse',
    holiday_orthodox_easter: 'E Hëna e Pashkëve Ortodokse',
    holiday_cyril_methodius: 'Dita e Shën Kirilit dhe Metodit',
    holiday_republic_day: 'Dita e Republikës (Ilinden)',
    holiday_independence_day: 'Dita e Pavarësisë',
    holiday_uprising_day: 'Dita e Kryengritjes Popullore',
    holiday_revolutionary_struggle: 'Dita e Luftës Revolucionare Maqedonase',
    holiday_all_saints: 'Dita e të Gjithë Shenjtorëve',
    holiday_clement_ohrid: 'Dita e Shën Klementit të Ohrit',
    event_cleanup: 'Pastrimi i Parkut të Qytetit',
    event_music_festival: 'Festivali Veror i Muzikës',
    event_town_hall: 'Mbledhje në Bashki',

    // News
    news_and_alerts: 'Lajme & Njoftime',
    Upcoming: 'Në pritje',
    Ongoing: 'Në proces',
    Completed: 'Përfunduar',
    news_construction_title: 'Rindërtimi i rrugës "Partizanska"',
    news_construction_desc: 'Rruga kryesore "Partizanska" do të jetë e mbyllur për rindërtim. Ju lutemi përdorni rrugë alternative.',
    news_water_outage_title: 'Ndërprerje e ujit në lagjen "Qendër"',
    news_water_outage_desc: 'Për shkak të mirëmbajtjes së planifikuar, do të ketë ndërprerje të përkohshme të ujit nga ora 9:00 deri në 15:00.',
    news_public_notice_title: 'Anketë publike për dizajnin e parkut të ri',
    news_public_notice_desc: 'Qytetarët ftohen të marrin pjesë në një anketë për dizajnin e ri të parkut qendror.',

    // Report
    submit_new_report: 'Dërgo Raport të Ri',
    photo_evidence: 'Dëshmi me Foto',
    add_photo_prompt: 'Shtoni një foto të problemit duke përdorur kamerën ose galerinë tuaj.',
    take_photo: 'Bëj Foto',
    tap_to_take_photo: 'Prekni për të fotografuar',
    choose_from_gallery: 'Zgjidh nga Galeria',
    change_photo: 'Ndrysho Foton',
    use_camera_gallery: 'Përdor kamerën ose galerinë tënde',
    location: 'Vendndodhja',
    location_acquiring: 'Po merret sinjali GPS...',
    location_error: 'Ju lutemi aktivizoni aksesin në vendndodhje në cilësimet e shfletuesit tuaj.',
    brief_description: 'Përshkrim i shkurtër',
    description_placeholder: 'p.sh., Gropë e madhe në Rrugën Kryesore.',
    title: 'Titulli',
    category: 'Kategoria',
    analyzing: 'Duke analizuar...',
    submitting: 'Duke dërguar...',
    submit_report: 'Dërgo Raportin',
    report_submitted: 'Raporti u Dërgua!',
    report_submitted_desc: 'Faleminderit për kontributin tuaj në komunitetin tonë.',
    back_to_dashboard: 'Kthehu te Paneli',
    error_required_fields: 'Fotoja dhe vendndodhja janë të detyrueshme.',
    error_ai_analysis: 'Analiza e IA dështoi. Ju lutemi plotësoni detajet manualisht.',
    report_summary_title: 'Përmbledhja e Raportit',
    submitted_title: 'Titulli',
    submitted_category: 'Kategoria',
    submitted_location: 'Vendndodhja',
    confirm_submission_title: 'Konfirmo Dorëzimin',
    confirm_submission_body: 'A jeni i sigurt që doni ta dërgoni këtë raport?',
    confirm_submit: 'Konfirmo',
    cancel: 'Anulo',
    no_reports_yet: 'Asnjë raport nuk është dërguar ende.',
    no_reports_map: 'Nuk ka ende raporte të dërguara. Kur të ketë, ato do të shfaqen këtu.',
    map_of_reports: 'Harta e Raporteve',
    preview: 'Pamje paraprake',
    add_photo: 'Shto Foto',
    loading: 'Duke u ngarkuar...',
    rate: 'Tarifa',
    duration_hours: 'Kohëzgjatja (Orë)',
    pay_now: 'Paguaj Tani',

    // Categories
    Pothole: 'Gropë',
    Garbage: 'Mbeturina',
    Streetlight: 'Ndriçim rrugor',
    Graffiti: 'Grafiti',
    'Damaged Sign': 'Shenjë e dëmtuar',
    'Park Maintenance': 'Mirëmbajtje parku',
    Other: 'Tjetër',


    // Onboarding Tutorial
    skip: 'Anashkalo',
    get_started: 'Fillo',
    onboarding_welcome_title: 'Mirë se vini në E-Kërçova',
    onboarding_welcome_text: 'Shërbimet tuaja komunale në një vend të përshtatshëm',
    onboarding_report_title: 'Raporto Probleme',
    onboarding_report_text: 'Bëni një foto dhe raportoni çështjet komunale menjëherë. Ndihmoni ta bëjmë qytetin tonë më të mirë!',
    onboarding_parking_title: 'Parkim i Shpejtë',
    onboarding_parking_text: 'Paguani për parking lehtësisht nga telefoni juaj. Nuk ka më kërkim për parkometra!',
    onboarding_events_title: 'Qëndroni të Informuar',
    onboarding_events_text: 'Kontrolloni ngjarjet, lajmet dhe zbuloni atraksionet lokale në një vend',
    onboarding_done_title: "Jeni Gati!",
    onboarding_done_text: 'Gati për të eksploruar të gjitha veçoritë dhe për të shfrytëzuar shërbimet tona',


    // Tutorial
    skip_tutorial: "Anashkalo",
    finish_tutorial: "Përfundo",
    tutorial_report_title: "Raporto një Problem",
    tutorial_report_desc: "Prekni këtu për të raportuar probleme si gropa ose ndriçim i prishur rrugor. Fotografia dhe vendndodhja juaj na ndihmojnë t'i rregullojmë gjërat më shpejt.",
    tutorial_parking_title: "Paguaj për Parking",
    tutorial_parking_desc: "Menaxhoni dhe paguani lehtësisht për parking në zona të ndryshme të qytetit direkt nga aplikacioni.",
    tutorial_wallet_title: "Portofoli Juaj Dixhital",
    tutorial_wallet_desc: "Ky është bilanci juaj. Shtoni fonde këtu për të paguar pa probleme për parking dhe shërbime të tjera.",
    get_directions: "Merr Udhëzime",
    report_details: "Detajet e Raportit",
    no_photo: "Nuk ka Foto",
    location_acquired: "Vendndodhja u mor",
    fetching_location: "Po merret vendndodhja...",
    please_wait_gps: "Ju lutemi prisni ndërsa merrni koordinatat tuaja GPS.",
  },
};

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey | string, params?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem('language');
    return (storedLang && ['en', 'mk', 'sq'].includes(storedLang)) ? storedLang as Language : 'en';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = (key: TranslationKey | string, params?: { [key: string]: string | number }) => {
    let translation = translations[language][key as TranslationKey] || translations.en[key as TranslationKey] || key;
    if (params) {
      Object.keys(params).forEach(pKey => {
        translation = translation.replace(`{${pKey}}`, String(params[pKey]));
      });
    }
    return translation;
  };

  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children);
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

