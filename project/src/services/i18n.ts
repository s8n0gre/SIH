export interface Translation {
  [key: string]: string;
}

export interface Translations {
  [language: string]: Translation;
}

export const translations: Translations = {
  en: {
    // Header
    appName: 'CivicReport',
    appSubtitle: 'Municipal Services',
    home: 'Home',
    reportIssue: 'Report Issue',
    mapView: 'Map View',
    emergency: 'Emergency',
    myReports: 'My Reports',
    adminDashboard: 'Admin Dashboard',
    
    // Report Issue
    reportTitle: 'Report an Issue',
    reportSubtitle: 'Help improve your community by reporting municipal issues.',
    issueTitle: 'Issue Title',
    issueTitlePlaceholder: 'Brief description of the issue',
    category: 'Category (Optional - AI will detect)',
    categoryAuto: 'Let AI detect automatically',
    description: 'Description',
    descriptionPlaceholder: 'Detailed description of the issue, including any relevant context',
    location: 'Location',
    locationPlaceholder: 'Street address or landmark',
    gps: 'GPS',
    photosVideos: 'Photos/Videos',
    uploadText: 'Click to upload photos or videos',
    uploadSubtext: 'Support for multiple files, up to 10MB each',
    submitReport: 'Submit Report',
    reportSubmitted: 'Report Submitted!',
    analyzing: 'Analyzing...',
    
    // Categories
    roadsInfrastructure: 'Roads & Infrastructure',
    waterServices: 'Water Services',
    electricity: 'Electricity',
    wasteManagement: 'Waste Management',
    parksRecreation: 'Parks & Recreation',
    publicSafety: 'Public Safety',
    other: 'Other',
    
    // AI Status
    localAI: 'Local AI',
    checking: 'Checking...',
    online: 'Online',
    offline: 'Offline',
    
    // Admin Dashboard
    municipalDashboard: 'Municipal Dashboard',
    dashboardSubtitle: 'Real-time civic issues analytics',
    export: 'Export',
    barChart: 'Bar Chart',
    pieChart: 'Pie Chart',
    totalIssues: 'Total Issues',
    departments: 'Departments',
    highPriority: 'High Priority',
    avgPerDept: 'Avg per Dept',
    issuesDistribution: 'Issues Distribution',
    emergencyLevelGuide: 'Emergency Level Guide',
    highPriorityLabel: 'High Priority',
    mediumPriorityLabel: 'Medium Priority',
    lowPriorityLabel: 'Low Priority',
    issues: 'issues'
  },
  
  hi: {
    // Header
    appName: 'नागरिक रिपोर्ट',
    appSubtitle: 'नगरपालिका सेवाएं',
    home: 'होम',
    reportIssue: 'समस्या रिपोर्ट करें',
    mapView: 'मैप व्यू',
    emergency: 'आपातकाल',
    myReports: 'मेरी रिपोर्ट्स',
    adminDashboard: 'एडमिन डैशबोर्ड',
    
    // Report Issue
    reportTitle: 'समस्या रिपोर्ट करें',
    reportSubtitle: 'नगरपालिका की समस्याओं की रिपोर्ट करके अपने समुदाय को बेहतर बनाने में मदद करें।',
    issueTitle: 'समस्या का शीर्षक',
    issueTitlePlaceholder: 'समस्या का संक्षिप्त विवरण',
    category: 'श्रेणी (वैकल्पिक - AI स्वचालित रूप से पहचान लेगा)',
    categoryAuto: 'AI को स्वचालित रूप से पहचानने दें',
    description: 'विवरण',
    descriptionPlaceholder: 'समस्या का विस्तृत विवरण, प्रासंगिक संदर्भ सहित',
    location: 'स्थान',
    locationPlaceholder: 'सड़क का पता या मील का पत्थर',
    gps: 'जीपीएस',
    photosVideos: 'फोटो/वीडियो',
    uploadText: 'फोटो या वीडियो अपलोड करने के लिए क्लिक करें',
    uploadSubtext: 'कई फाइलों का समर्थन, प्रत्येक 10MB तक',
    submitReport: 'रिपोर्ट जमा करें',
    reportSubmitted: 'रिपोर्ट जमा की गई!',
    analyzing: 'विश्लेषण कर रहे हैं...',
    
    // Categories
    roadsInfrastructure: 'सड़क और बुनियादी ढांचा',
    waterServices: 'जल सेवाएं',
    electricity: 'बिजली',
    wasteManagement: 'अपशिष्ट प्रबंधन',
    parksRecreation: 'पार्क और मनोरंजन',
    publicSafety: 'सार्वजनिक सुरक्षा',
    other: 'अन्य',
    
    // AI Status
    localAI: 'स्थानीय AI',
    checking: 'जांच रहे हैं...',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',
    
    // Admin Dashboard
    municipalDashboard: 'नगरपालिका डैशबोर्ड',
    dashboardSubtitle: 'वास्तविक समय नागरिक मुद्दे विश्लेषण',
    export: 'निर्यात',
    barChart: 'बार चार्ट',
    pieChart: 'पाई चार्ट',
    totalIssues: 'कुल मुद्दे',
    departments: 'विभाग',
    highPriority: 'उच्च प्राथमिकता',
    avgPerDept: 'प्रति विभाग औसत',
    issuesDistribution: 'मुद्दों का वितरण',
    emergencyLevelGuide: 'आपातकालीन स्तर गाइड',
    highPriorityLabel: 'उच्च प्राथमिकता',
    mediumPriorityLabel: 'मध्यम प्राथमिकता',
    lowPriorityLabel: 'कम प्राथमिकता',
    issues: 'मुद्दे'
  },
  
  // Santali (Ol Chiki script)
  sat: {
    // Header
    appName: 'ᱥᱤᱵᱤᱠ ᱨᱤᱯᱚᱨᱴ',
    appSubtitle: 'ᱱᱚᱜᱚᱨ ᱥᱮᱵᱟ',
    home: 'ᱚᱲᱟᱜ',
    reportIssue: 'ᱵᱟᱝ ᱵᱟᱰᱟᱭ ᱠᱚ',
    mapView: 'ᱱᱚᱠᱥᱟ',
    emergency: 'ᱟᱯᱟᱛ',
    myReports: 'ᱤᱧᱟᱜ ᱨᱤᱯᱚᱨᱴ',
    adminDashboard: 'ᱮᱰᱢᱤᱱ ᱰᱮᱥᱵᱚᱨᱰ',
    
    // Report Issue
    reportTitle: 'ᱵᱟᱝ ᱵᱟᱰᱟᱭ ᱠᱚ ᱞᱟᱹᱜᱤᱫ',
    reportSubtitle: 'ᱱᱚᱜᱚᱨ ᱨᱮᱱᱟᱜ ᱵᱟᱝ ᱵᱟᱰᱟᱭ ᱠᱚ ᱞᱟᱹᱜᱤᱫ ᱟᱢᱟᱜ ᱜᱚᱴᱟ ᱥᱟᱶᱛᱮ ᱜᱚᱲᱚ ᱮᱢᱚᱜ ᱢᱮ᱾',
    issueTitle: 'ᱵᱟᱝ ᱵᱟᱰᱟᱭ ᱨᱮᱱᱟᱜ ᱧᱩᱛᱩᱢ',
    issueTitlePlaceholder: 'ᱵᱟᱝ ᱵᱟᱰᱟᱭ ᱨᱮᱱᱟᱜ ᱠᱷᱟᱴᱚ ᱞᱟᱹᱭ',
    category: 'ᱛᱷᱚᱠ (ᱵᱟᱝ ᱞᱟᱹᱠᱛᱤ - AI ᱧᱮᱞ ᱟᱭᱟ)',
    categoryAuto: 'AI ᱫᱚ ᱟᱡᱮ ᱧᱮᱞ ᱟᱭᱟ',
    description: 'ᱞᱟᱹᱭ',
    descriptionPlaceholder: 'ᱵᱟᱝ ᱵᱟᱰᱟᱭ ᱨᱮᱱᱟᱜ ᱯᱩᱨᱟᱹᱣ ᱞᱟᱹᱭ',
    location: 'ᱡᱟᱭᱜᱟ',
    locationPlaceholder: 'ᱥᱚᱲᱚᱠ ᱨᱮᱱᱟᱜ ᱴᱷᱤᱠᱟᱹᱱᱟ',
    gps: 'ᱡᱤᱯᱤᱮᱥ',
    photosVideos: 'ᱪᱤᱛᱟᱹᱨ/ᱵᱷᱤᱰᱤᱭᱚ',
    uploadText: 'ᱪᱤᱛᱟᱹᱨ ᱟᱨ ᱵᱷᱤᱰᱤᱭᱚ ᱞᱟᱹᱜᱤᱫ ᱚᱛᱮ ᱢᱮ',
    uploadSubtext: 'ᱟᱭᱢᱟ ᱨᱮᱫ, ᱢᱤᱫᱴᱟᱝ 10MB ᱦᱟᱹᱵᱤᱡ',
    submitReport: 'ᱨᱤᱯᱚᱨᱴ ᱡᱚᱢᱟ',
    reportSubmitted: 'ᱨᱤᱯᱚᱨᱴ ᱡᱚᱢᱟ ᱮᱱᱟ!',
    analyzing: 'ᱧᱮᱞ ᱟᱠᱟᱫᱟ...',
    
    // Categories  
    roadsInfrastructure: 'ᱥᱚᱲᱚᱠ ᱟᱨ ᱵᱩᱱᱤᱭᱟᱹᱫᱤ',
    waterServices: 'ᱫᱟᱜ ᱥᱮᱵᱟ',
    electricity: 'ᱵᱤᱡᱽᱞᱤ',
    wasteManagement: 'ᱠᱩᱲᱟᱹᱭ ᱵᱮᱵᱚᱥᱛᱟ',
    parksRecreation: 'ᱵᱟᱜᱟᱱ ᱟᱨ ᱠᱷᱮᱞ',
    publicSafety: 'ᱥᱟᱱᱟᱢ ᱨᱮᱱᱟᱜ ᱨᱟᱠᱷᱟ',
    other: 'ᱮᱴᱟᱜ',
    
    // AI Status
    localAI: 'ᱚᱲᱟᱜ AI',
    checking: 'ᱧᱮᱞ ᱟᱠᱟᱫᱟ...',
    online: 'ᱚᱱᱞᱟᱭᱤᱱ',
    offline: 'ᱚᱯᱷᱞᱟᱭᱤᱱ',
    
    // Admin Dashboard
    municipalDashboard: 'ᱱᱚᱜᱚᱨ ᱰᱮᱥᱵᱚᱨᱰ',
    dashboardSubtitle: 'ᱱᱤᱛᱚᱜ ᱚᱠᱛᱚ ᱨᱮ ᱱᱟᱜᱟᱨᱤᱭᱟᱹ ᱵᱟᱝ ᱵᱟᱰᱟᱭ',
    export: 'ᱵᱟᱦᱨᱮ ᱠᱚᱞ',
    barChart: 'ᱵᱟᱨ ᱪᱟᱨᱴ',
    pieChart: 'ᱯᱟᱭ ᱪᱟᱨᱴ',
    totalIssues: 'ᱡᱚᱛᱚ ᱵᱟᱝ ᱵᱟᱰᱟᱭ',
    departments: 'ᱵᱤᱵᱷᱟᱜᱽ',
    highPriority: 'ᱢᱟᱨᱟᱝ ᱞᱟᱹᱠᱛᱤ',
    avgPerDept: 'ᱢᱤᱫ ᱵᱤᱵᱷᱟᱜᱽ ᱨᱮ',
    issuesDistribution: 'ᱵᱟᱝ ᱵᱟᱰᱟᱭ ᱦᱟᱹᱴᱤᱧ',
    emergencyLevelGuide: 'ᱟᱯᱟᱛ ᱞᱮᱵᱮᱞ ᱜᱟᱭᱤᱰ',
    highPriorityLabel: 'ᱢᱟᱨᱟᱝ ᱞᱟᱹᱠᱛᱤ',
    mediumPriorityLabel: 'ᱛᱟᱞᱟ ᱞᱟᱹᱠᱛᱤ',
    lowPriorityLabel: 'ᱠᱚᱢ ᱞᱟᱹᱠᱛᱤ',
    issues: 'ᱵᱟᱝ ᱵᱟᱰᱟᱭ'
  },
  
  // Ho (Warang Citi script)
  hoc: {
    // Header
    appName: '𑣁𑣂𑣋𑣂𑣇 𑣔𑣂𑣎𑣋𑣔𑣂𑣇',
    appSubtitle: '𑣒𑣋𑣎𑣔 𑣑𑣋𑣇',
    home: '𑣋𑣔𑣋𑣎',
    reportIssue: '𑣎𑣋𑣒 𑣔𑣂𑣎𑣋𑣔𑣂𑣇',
    mapView: '𑣒𑣋𑣎 𑣇𑣋𑣇',
    emergency: '𑣋𑣎𑣋𑣇',
    myReports: '𑣋𑣒 𑣔𑣂𑣎𑣋𑣔𑣂𑣇',
    adminDashboard: '𑣋𑣇𑣋𑣔 𑣇𑣋𑣑𑣇',
    
    // Report Issue
    reportTitle: '𑣎𑣋𑣒 𑣔𑣂𑣎𑣋𑣔𑣂𑣇 𑣇𑣋',
    reportSubtitle: '𑣒𑣋𑣎𑣔 𑣔𑣋 𑣎𑣋𑣒 𑣇𑣋 𑣔𑣂𑣎𑣋𑣔𑣂𑣇 𑣇𑣋𑣔 𑣋𑣎𑣒 𑣑𑣋𑣇𑣋 𑣑𑣋𑣇𑣋𑣔 𑣇𑣋',
    issueTitle: '𑣎𑣋𑣒 𑣔𑣋 𑣒𑣋𑣒',
    issueTitlePlaceholder: '𑣎𑣋𑣒 𑣔𑣋 𑣑𑣋𑣇𑣋 𑣇𑣋𑣇',
    category: '𑣇𑣋𑣔 (𑣒𑣋 𑣇𑣋𑣔 - AI 𑣇𑣋𑣇 𑣇𑣋)',
    categoryAuto: 'AI 𑣇𑣋 𑣋𑣇𑣋 𑣇𑣋𑣇 𑣇𑣋',
    description: '𑣇𑣋𑣇',
    descriptionPlaceholder: '𑣎𑣋𑣒 𑣔𑣋 𑣑𑣋𑣇𑣋 𑣇𑣋𑣇',
    location: '𑣇𑣋𑣎𑣋',
    locationPlaceholder: '𑣑𑣋𑣔𑣋𑣇 𑣔𑣋 𑣇𑣋𑣎𑣋',
    gps: '𑣇𑣂𑣎𑣂𑣑',
    photosVideos: '𑣑𑣂𑣇𑣋/𑣋𑣂𑣇𑣂𑣋',
    uploadText: '𑣑𑣂𑣇𑣋 𑣋𑣔 𑣋𑣂𑣇𑣂𑣋 𑣇𑣋 𑣇𑣂𑣇 𑣇𑣋',
    uploadSubtext: '𑣋𑣒𑣋 𑣔𑣋𑣇, 𑣋𑣇 10MB 𑣇𑣋𑣇',
    submitReport: '𑣔𑣂𑣎𑣋𑣔𑣂𑣇 𑣇𑣋𑣒',
    reportSubmitted: '𑣔𑣂𑣎𑣋𑣔𑣂𑣇 𑣇𑣋𑣒 𑣋𑣒!',
    analyzing: '𑣇𑣋𑣇 𑣔𑣋𑣇...',
    
    // Categories
    roadsInfrastructure: '𑣑𑣋𑣔𑣋𑣇 𑣋𑣔 𑣇𑣋𑣒𑣂𑣇𑣋𑣇',
    waterServices: '𑣇𑣋𑣎 𑣑𑣋𑣇',
    electricity: '𑣇𑣂𑣇𑣂𑣇',
    wasteManagement: '𑣇𑣋𑣔𑣋 𑣇𑣋𑣇𑣑𑣇',
    parksRecreation: '𑣇𑣋𑣎 𑣋𑣔 𑣇𑣋𑣇',
    publicSafety: '𑣑𑣋𑣇𑣂𑣇 𑣔𑣋𑣇𑣋',
    other: '𑣋𑣒𑣋',
    
    // AI Status
    localAI: '𑣑𑣋𑣒 AI',
    checking: '𑣇𑣋𑣇 𑣔𑣋𑣇...',
    online: '𑣋𑣒𑣇𑣋𑣇',
    offline: '𑣋𑣒𑣇𑣋𑣇 𑣒𑣋',
    
    // Admin Dashboard
    municipalDashboard: '𑣒𑣋𑣎𑣔 𑣇𑣋𑣑𑣇',
    dashboardSubtitle: '𑣋𑣇 𑣑𑣋𑣒 𑣒𑣋𑣎𑣔𑣂 𑣎𑣋𑣒',
    export: '𑣇𑣋𑣔 𑣇𑣋',
    barChart: '𑣇𑣋𑣔 𑣇𑣋𑣔𑣂𑣇',
    pieChart: '𑣎𑣋𑣇 𑣇𑣋𑣔𑣂𑣇',
    totalIssues: '𑣑𑣋𑣇𑣋 𑣎𑣋𑣒',
    departments: '𑣇𑣂𑣇𑣋𑣎',
    highPriority: '𑣋𑣒𑣋 𑣇𑣋𑣔𑣂',
    avgPerDept: '𑣋𑣇 𑣇𑣂𑣇𑣋𑣎 𑣔𑣋',
    issuesDistribution: '𑣎𑣋𑣒 𑣇𑣋𑣇𑣂𑣒',
    emergencyLevelGuide: '𑣋𑣎𑣋𑣇 𑣇𑣋𑣇 𑣎𑣋𑣇',
    highPriorityLabel: '𑣋𑣒𑣋 𑣇𑣋𑣔𑣂',
    mediumPriorityLabel: '𑣇𑣋𑣇𑣋 𑣇𑣋𑣔𑣂',
    lowPriorityLabel: '𑣇𑣋𑣒 𑣇𑣋𑣔𑣂',
    issues: '𑣎𑣋𑣒'
  },
  
  // Mundari (Devanagari script)
  unr: {
    // Header
    appName: 'सिविक रिपोर्ट',
    appSubtitle: 'नगर सेवा',
    home: 'ओड़ाक्',
    reportIssue: 'बाङ् रिपोर्ट',
    mapView: 'नक्सा देखाव्',
    emergency: 'आपात्',
    myReports: 'आइङ्गाक् रिपोर्ट',
    adminDashboard: 'एडमिन डेसबोर्ड',
    
    // Report Issue
    reportTitle: 'बाङ् रिपोर्ट एमे',
    reportSubtitle: 'नगर रेयाक् बाङ् कुली रिपोर्ट एमे तेयाक् आपेयाक् गोटा सुधार होयोक्आ।',
    issueTitle: 'बाङ् रेयाक् नुतुम्',
    issueTitlePlaceholder: 'बाङ् रेयाक् खाटो काजी',
    category: 'खण्ड (बाङ् लागित् - AI देखाव्आ)',
    categoryAuto: 'AI आजे देखाव्आ',
    description: 'काजी',
    descriptionPlaceholder: 'बाङ् रेयाक् पुरा काजी',
    location: 'जागा',
    locationPlaceholder: 'सड़क् रेयाक् ठिकाना',
    gps: 'जीपीएस',
    photosVideos: 'चित्र/भिडियो',
    uploadText: 'चित्र आर भिडियो अपलोड लागित् दबाव्',
    uploadSubtext: 'गोटा फाइल, मित्टाक् 10MB जाक्',
    submitReport: 'रिपोर्ट जमा',
    reportSubmitted: 'रिपोर्ट जमा एना!',
    analyzing: 'देखाव् अकाना...',
    
    // Categories
    roadsInfrastructure: 'सड़क् आर बुनियादी',
    waterServices: 'दाक् सेवा',
    electricity: 'बिजली',
    wasteManagement: 'कुड़ा व्यवस्था',
    parksRecreation: 'बागान आर खेल',
    publicSafety: 'सानाम् रेयाक् राखा',
    other: 'एटाक्',
    
    // AI Status
    localAI: 'ओड़ाक् AI',
    checking: 'देखाव् अकाना...',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',
    
    // Admin Dashboard
    municipalDashboard: 'नगर डेसबोर्ड',
    dashboardSubtitle: 'नित्तुक् ओक्तो रे नागरिक बाङ्',
    export: 'बाहरे कुल',
    barChart: 'बार चार्ट',
    pieChart: 'पाई चार्ट',
    totalIssues: 'जोतो बाङ्',
    departments: 'बिभाग्',
    highPriority: 'मारांग् लागित्',
    avgPerDept: 'मित् बिभाग् रे',
    issuesDistribution: 'बाङ् हाटिङ्',
    emergencyLevelGuide: 'आपात् लेवेल गाइड',
    highPriorityLabel: 'मारांग् लागित्',
    mediumPriorityLabel: 'तला लागित्',
    lowPriorityLabel: 'कम् लागित्',
    issues: 'बाङ्'
  }
};

export class I18nService {
  private currentLanguage: string = 'en';
  
  setLanguage(language: string) {
    this.currentLanguage = language;
    localStorage.setItem('selectedLanguage', language);
  }
  
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }
  
  getLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
      { code: 'hoc', name: 'Ho', nativeName: '𑣍𑣉𑣁' },
      { code: 'unr', name: 'Mundari', nativeName: 'मुण्डारी' }
    ];
  }
  
  t(key: string): string {
    const translation = translations[this.currentLanguage]?.[key];
    return translation || translations.en[key] || key;
  }
  
  initializeLanguage() {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && translations[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    }
  }
}

export const i18n = new I18nService();