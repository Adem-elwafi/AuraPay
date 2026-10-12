export type Language = 'fr' | 'ar' | 'en';

export interface Translations {
  // Navigation & Common
  app_name: string;
  loading: string;
  save: string;
  cancel: string;
  close: string;
  confirm: string;
  error: string;
  success: string;
  copy: string;
  copied: string;
  nav_dashboard: string;
  nav_cards: string;
  nav_transactions: string;
  nav_analytics: string;
  nav_profile: string;
  nav_settings: string;
  nav_logout: string;
  nav_notifications: string;
  nav_section_main: string;
  nav_section_manage: string;
  nav_collapse: string;
  nav_expand: string;
  nav_open_menu: string;
  nav_theme_toggle: string;
  nav_language: string;
  greeting_morning: string;
  greeting_evening: string;

  // Balance & Elite Card
  balance_title: string;
  balance_label: string;
  balance_main: string;
  monthly_limit: string;
  monthly_limit_used: string;
  limit_spent_of: string;
  deposit: string;
  withdraw: string;
  freeze_card: string;
  unfreeze_card: string;
  card_frozen: string;
  card_active: string;
  card_holder: string;
  card_expires: string;
  manage: string;

  // Quick Transfer
  quick_transfer_title: string;
  mode_p2p: string;
  mode_expense: string;
  mode_deposit: string;
  p2p_subtitle: string;
  expense_subtitle: string;
  deposit_subtitle: string;
  recent_contacts: string;
  recipient_placeholder: string;
  expense_category: string;
  amount_label: string;
  description_placeholder: string;
  confirm_transfer: string;
  confirm_expense: string;
  confirm_deposit: string;
  processing: string;
  op_success: string;
  overbalance_warning: string;
  estimated_balance: string;

  // Stats & Trends
  revenues_month: string;
  spending: string;
  savings: string;
  recent_activity: string;
  view_all: string;
  no_transactions_yet: string;
  no_transactions_recent: string;
  history_title: string;
  search_tx: string;
  export_csv: string;
  filter: string;
  all_types: string;
  all_categories: string;
  credit_type: string;
  debit_type: string;

  // Categories
  cat_food: string;
  cat_transport: string;
  cat_leisure: string;
  cat_shopping: string;
  cat_revenues: string;
  cat_other: string;

  // Profile & Auth
  profile_title: string;
  profile_subtitle: string;
  full_name: string;
  email: string;
  username: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
  change_password: string;
  security: string;
  personal_info: string;
}

export const translations: Record<Language, Translations> = {
  fr: {
    app_name: 'SmartWallet',
    loading: 'Chargement en cours…',
    save: 'Enregistrer',
    cancel: 'Annuler',
    close: 'Fermer',
    confirm: 'Confirmer',
    error: 'Erreur',
    success: 'Succès',
    copy: 'Copier',
    copied: 'Copié !',
    nav_dashboard: 'Tableau de bord',
    nav_cards: 'Cartes',
    nav_transactions: 'Transactions',
    nav_analytics: 'Analyses',
    nav_profile: 'Profil',
    nav_settings: 'Paramètres',
    nav_logout: 'Déconnexion',
    nav_notifications: 'Notifications',
    nav_section_main: 'Menu principal',
    nav_section_manage: 'Gestion',
    nav_collapse: 'Réduire la barre latérale',
    nav_expand: 'Agrandir la barre latérale',
    nav_open_menu: 'Ouvrir le menu',
    nav_theme_toggle: 'Changer de thème',
    nav_language: 'Langue',
    greeting_morning: 'Bonjour',
    greeting_evening: 'Bonsoir',

    balance_title: 'Votre carte Elite',
    balance_label: 'Solde disponible',
    balance_main: 'Solde principal',
    monthly_limit: 'Plafond mensuel',
    monthly_limit_used: 'Plafond mensuel utilisé',
    limit_spent_of: 'sur',
    deposit: 'Déposer',
    withdraw: 'Retirer',
    freeze_card: 'Geler',
    unfreeze_card: 'Débloquer',
    card_frozen: 'Carte verrouillée',
    card_active: 'Carte active · paiements sans contact activés',
    card_holder: 'Titulaire',
    card_expires: 'Expire',
    manage: 'Gérer',

    quick_transfer_title: 'Transfert rapide',
    mode_p2p: 'Transfert P2P',
    mode_expense: 'Dépense',
    mode_deposit: 'Dépôt',
    p2p_subtitle: 'Envoyez des fonds en temps réel à un autre compte SmartWallet.',
    expense_subtitle: 'Enregistrez une dépense catégorisée en quelques secondes.',
    deposit_subtitle: 'Alimentez instantanément votre portefeuille SmartWallet.',
    recent_contacts: 'Contacts récents',
    recipient_placeholder: 'Identifiant destinataire (SW-…)',
    expense_category: 'Catégorie de dépense',
    amount_label: 'Montant en Dinars',
    description_placeholder: 'Motif / description (optionnel)',
    confirm_transfer: 'Confirmer le virement',
    confirm_expense: 'Enregistrer la dépense',
    confirm_deposit: 'Confirmer le dépôt',
    processing: 'Traitement en cours…',
    op_success: 'Opération confirmée avec succès',
    overbalance_warning: 'Montant supérieur au solde disponible',
    estimated_balance: 'Solde estimé après opération :',

    revenues_month: 'Revenus ce mois',
    spending: 'Dépenses',
    savings: 'Économies',
    recent_activity: 'Flux récents',
    view_all: 'Tout voir',
    no_transactions_yet: 'Aucune transaction pour le moment. Appuyez sur + pour ajouter votre première dépense',
    no_transactions_recent: 'Vos opérations récentes apparaîtront ici',
    history_title: 'Historique Complet des Opérations',
    search_tx: 'Rechercher une transaction...',
    export_csv: 'Exporter CSV',
    filter: 'Filtrer :',
    all_types: 'Tous les types',
    all_categories: 'Toutes les catégories',
    credit_type: 'Recettes (+)',
    debit_type: 'Dépenses (−)',

    cat_food: 'Alimentation & Restauration',
    cat_transport: 'Transport & Mobilité',
    cat_leisure: 'Loisirs & Style de vie',
    cat_shopping: 'Shopping',
    cat_revenues: 'Revenus',
    cat_other: 'Autre',

    profile_title: 'Mon Profil Elite',
    profile_subtitle: 'Gérez vos informations de compte et vos préférences de sécurité.',
    full_name: 'Nom complet',
    email: 'Adresse e-mail',
    username: "Nom d'utilisateur",
    current_password: 'Mot de passe actuel',
    new_password: 'Nouveau mot de passe',
    confirm_password: 'Confirmer le mot de passe',
    change_password: 'Changer le mot de passe',
    security: 'Sécurité du compte',
    personal_info: 'Informations personnelles',
  },
  ar: {
    app_name: 'سمارت واليت',
    loading: 'جاري التحميل…',
    save: 'حفظ',
    cancel: 'إلغاء',
    close: 'إغلاق',
    confirm: 'تأكيد',
    error: 'خطأ',
    success: 'نجاح',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    nav_dashboard: 'لوحة القيادة',
    nav_cards: 'البطاقات',
    nav_transactions: 'المعاملات',
    nav_analytics: 'التحليلات',
    nav_profile: 'الملف الشخصي',
    nav_settings: 'الإعدادات',
    nav_logout: 'تسجيل الخروج',
    nav_notifications: 'الإشعارات',
    nav_section_main: 'القائمة الرئيسية',
    nav_section_manage: 'الإدارة',
    nav_collapse: 'طي الشريط الجانبي',
    nav_expand: 'توسيع الشريط الجانبي',
    nav_open_menu: 'فتح القائمة',
    nav_theme_toggle: 'تغيير المظهر',
    nav_language: 'اللغة',
    greeting_morning: 'صباح الخير',
    greeting_evening: 'مساء الخير',

    balance_title: 'بطاقتك النخبة',
    balance_label: 'الرصيد المتوفر',
    balance_main: 'الرصيد الرئيسي',
    monthly_limit: 'السقف الشهري',
    monthly_limit_used: 'السقف الشهري المستهلك',
    limit_spent_of: 'من',
    deposit: 'إيداع',
    withdraw: 'سحب',
    freeze_card: 'تجميد',
    unfreeze_card: 'إلغاء التجميد',
    card_frozen: 'البطاقة مقفلة',
    card_active: 'البطاقة نشطة · الدفع بدون تلامس مفعل',
    card_holder: 'صاحب الحساب',
    card_expires: 'صالحة حتى',
    manage: 'إدارة',

    quick_transfer_title: 'تحويل سريع',
    mode_p2p: 'تحويل P2P',
    mode_expense: 'مصاريف',
    mode_deposit: 'إيداع',
    p2p_subtitle: 'أرسل أموالاً فورية إلى حساب سمارت واليت آخر.',
    expense_subtitle: 'سجّل مصاريفك اليومية مع تصنيفها بدقة.',
    deposit_subtitle: 'اشحن رصيد محفظتك الرقمية في ثوانٍ.',
    recent_contacts: 'جهات الاتصال الأخيرة',
    recipient_placeholder: 'معرف المستلم (SW-…)',
    expense_category: 'تصنيف المصاريف',
    amount_label: 'المبلغ بالدينار التونسي',
    description_placeholder: 'السبب / الوصف (اختياري)',
    confirm_transfer: 'تأكيد التحويل',
    confirm_expense: 'تسجيل المصاريف',
    confirm_deposit: 'تأكيد الإيداع',
    processing: 'جاري المعالجة…',
    op_success: 'تمت العملية بنجاح',
    overbalance_warning: 'المبلغ أكبر من الرصيد المتوفر',
    estimated_balance: 'الرصيد التقديري بعد العملية:',

    revenues_month: 'مداخيل الشهر',
    spending: 'المصاريف',
    savings: 'المدخرات',
    recent_activity: 'النشاط الأخير',
    view_all: 'عرض الكل',
    no_transactions_yet: 'لا توجد معاملات حالياً. اضغط على + لإضافة أول مصاريفك',
    no_transactions_recent: 'ستظهر عملياتك الأخيرة هنا',
    history_title: 'سجل المعاملات الكامل',
    search_tx: 'بحث في المعاملات...',
    export_csv: 'تصدير CSV',
    filter: 'تصفية :',
    all_types: 'كل الأنواع',
    all_categories: 'كل الأصناف',
    credit_type: 'مداخيل (+)',
    debit_type: 'مصاريف (−)',

    cat_food: 'التغذية والمطاعم',
    cat_transport: 'النقل والمواصلات',
    cat_leisure: 'الترفيه ونمط الحياة',
    cat_shopping: 'التسوق',
    cat_revenues: 'المداخيل',
    cat_other: 'أخرى',

    profile_title: 'الملف الشخصي النخبة',
    profile_subtitle: 'إدارة بيانات حسابك وتفضيلات الأمان والحماية.',
    full_name: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    username: 'اسم المستخدم',
    current_password: 'كلمة المرور الحالية',
    new_password: 'كلمة المرور الجديدة',
    confirm_password: 'تأكيد كلمة المرور',
    change_password: 'تغيير كلمة المرور',
    security: 'أمان الحساب',
    personal_info: 'المعلومات الشخصية',
  },
  en: {
    app_name: 'SmartWallet',
    loading: 'Loading…',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    error: 'Error',
    success: 'Success',
    copy: 'Copy',
    copied: 'Copied!',
    nav_dashboard: 'Dashboard',
    nav_cards: 'Cards',
    nav_transactions: 'Transactions',
    nav_analytics: 'Analytics',
    nav_profile: 'Profile',
    nav_settings: 'Settings',
    nav_logout: 'Logout',
    nav_notifications: 'Notifications',
    nav_section_main: 'Main menu',
    nav_section_manage: 'Manage',
    nav_collapse: 'Collapse sidebar',
    nav_expand: 'Expand sidebar',
    nav_open_menu: 'Open menu',
    nav_theme_toggle: 'Toggle theme',
    nav_language: 'Language',
    greeting_morning: 'Good morning',
    greeting_evening: 'Good evening',

    balance_title: 'Your Elite Card',
    balance_label: 'Available Balance',
    balance_main: 'Main Balance',
    monthly_limit: 'Monthly Limit',
    monthly_limit_used: 'Monthly limit used',
    limit_spent_of: 'of',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    freeze_card: 'Freeze',
    unfreeze_card: 'Unfreeze',
    card_frozen: 'Card Locked',
    card_active: 'Active Card · Contactless enabled',
    card_holder: 'Cardholder',
    card_expires: 'Expires',
    manage: 'Manage',

    quick_transfer_title: 'Quick Transfer',
    mode_p2p: 'P2P Transfer',
    mode_expense: 'Expense',
    mode_deposit: 'Deposit',
    p2p_subtitle: 'Send real-time funds to another SmartWallet account.',
    expense_subtitle: 'Log a categorized personal expense in seconds.',
    deposit_subtitle: 'Instantly top up your SmartWallet account.',
    recent_contacts: 'Recent Contacts',
    recipient_placeholder: 'Recipient identifier (SW-…)',
    expense_category: 'Expense Category',
    amount_label: 'Amount in Dinars',
    description_placeholder: 'Reason / description (optional)',
    confirm_transfer: 'Confirm Transfer',
    confirm_expense: 'Record Expense',
    confirm_deposit: 'Confirm Deposit',
    processing: 'Processing…',
    op_success: 'Operation completed successfully',
    overbalance_warning: 'Amount exceeds available balance',
    estimated_balance: 'Estimated balance after:',

    revenues_month: 'Income this month',
    spending: 'Expenses',
    savings: 'Savings',
    recent_activity: 'Recent Activity',
    view_all: 'View All',
    no_transactions_yet: 'No transactions yet. Click + to add your first expense',
    no_transactions_recent: 'Your recent transactions will appear here',
    history_title: 'Complete Transaction History',
    search_tx: 'Search transactions...',
    export_csv: 'Export CSV',
    filter: 'Filter:',
    all_types: 'All types',
    all_categories: 'All categories',
    credit_type: 'Income (+)',
    debit_type: 'Expense (−)',

    cat_food: 'Food & Dining',
    cat_transport: 'Transport & Mobility',
    cat_leisure: 'Leisure & Lifestyle',
    cat_shopping: 'Shopping',
    cat_revenues: 'Income',
    cat_other: 'Other',

    profile_title: 'My Elite Profile',
    profile_subtitle: 'Manage your account details and security preferences.',
    full_name: 'Full Name',
    email: 'Email Address',
    username: 'Username',
    current_password: 'Current Password',
    new_password: 'New Password',
    confirm_password: 'Confirm Password',
    change_password: 'Change Password',
    security: 'Account Security',
    personal_info: 'Personal Information',
  },
};
