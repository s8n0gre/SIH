export interface Translation {
  [key: string]: string;
}

export interface Translations {
  [language: string]: Translation;
}

export const translations: Translations = {
  en: {
    // Header
    appName: 'LokSetu',
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
    issues: 'issues',
    
    // Community Feed
    communityFeed: 'Community Feed',
    stayUpdated: 'Stay updated with your community',
    welcome: 'Welcome',
    logout: 'Logout',
    elevateRole: 'Elevate Role',
    sysAdmin: 'SYS ADMIN (Click to Exit)',
    exitAdminMode: 'Exit system administrator mode?',
    exitedAdminMode: 'Exited admin mode. You are now a regular user.',
    roleElevated: 'Role elevated to System Administrator! You can now delete community posts.',
    invalidPassword: 'Invalid password. Access denied.',
    accessDenied: 'Access denied. Only system administrators can delete posts.',
    confirmDelete: 'Are you sure you want to delete this post? This action cannot be undone and will remove it from the database permanently.',
    postDeleted: 'Post deleted successfully from database.',
    demoPostRemoved: 'Demo post removed locally (demo posts are not stored in database).',
    votes: 'votes',
    addComment: 'Add a comment...',
    post: 'Post',
    delete: 'Delete',
    
    // Map View
    issueMap: 'Issue Map',
    searchIssues: 'Search issues...',
    allIssues: 'All Issues',
    open: 'Open',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    pending: 'Pending',
    completed: 'Completed',
    reports: 'Reports',
    loadingReports: 'Loading reports...',
    reportsAtLocation: 'Reports at this location',
    department: 'Department',
    status: 'Status',
    reported: 'Reported',
    
    // Report Modal
    briefDescription: 'Brief description of the issue',
    selectCategory: 'Select category',
    detailedDescription: 'Detailed description',
    addressLandmark: 'Address or landmark',
    photosMax: 'Photos (Max 5)',
    tapToAdd: 'Tap to add photos',
    maxPhotosReached: 'Maximum 5 photos reached',
    photosCount: 'photos',
    remove: 'Remove',
    
    // Database Viewer
    databaseViewer: 'Database Viewer',
    realTimeData: 'Real-time database monitoring',
    refreshData: 'Refresh Data',
    totalReports: 'Total Reports',
    totalUsers: 'Total Users',
    activeReports: 'Active Reports',
    resolvedReports: 'Resolved Reports',
    recentReports: 'Recent Reports',
    userManagement: 'User Management',
    reportManagement: 'Report Management',
    
    // Helpline
    helpline: 'Emergency Helpline',
    emergencyContacts: 'Emergency Contacts',
    police: 'Police',
    fire: 'Fire Department',
    ambulance: 'Ambulance',
    disaster: 'Disaster Management',
    women: 'Women Helpline',
    child: 'Child Helpline',
    call: 'Call',
    
    // Statistics
    statistics: 'Statistics',
    analyticsOverview: 'Analytics Overview',
    thisMonth: 'This Month',
    thisWeek: 'This Week',
    today: 'Today',
    trendingIssues: 'Trending Issues',
    departmentPerformance: 'Department Performance',
    responseTime: 'Response Time',
    resolutionRate: 'Resolution Rate'
  },
  
  hi: {
    // Header
    appName: 'लोकसेतु',
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
    issues: 'मुद्दे',
    
    // Community Feed
    communityFeed: 'सामुदायिक फीड',
    stayUpdated: 'अपने समुदाय के साथ अपडेट रहें',
    welcome: 'स्वागत',
    logout: 'लॉगआउट',
    elevateRole: 'भूमिका बढ़ाएं',
    sysAdmin: 'सिस्टम एडमिन (बाहर निकलने के लिए क्लिक करें)',
    exitAdminMode: 'सिस्टम एडमिनिस्ट्रेटर मोड से बाहर निकलें?',
    exitedAdminMode: 'एडमिन मोड से बाहर निकले। अब आप एक नियमित उपयोगकर्ता हैं।',
    roleElevated: 'भूमिका सिस्टम एडमिनिस्ट्रेटर तक बढ़ाई गई! अब आप सामुदायिक पोस्ट हटा सकते हैं।',
    invalidPassword: 'गलत पासवर्ड। पहुंच अस्वीकृत।',
    accessDenied: 'पहुंच अस्वीकृत। केवल सिस्टम एडमिनिस्ट्रेटर पोस्ट हटा सकते हैं।',
    confirmDelete: 'क्या आप वाकई इस पोस्ट को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
    postDeleted: 'पोस्ट सफलतापूर्वक डेटाबेस से हटा दी गई।',
    demoPostRemoved: 'डेमो पोस्ट स्थानीय रूप से हटा दी गई।',
    votes: 'वोट',
    addComment: 'टिप्पणी जोड़ें...',
    post: 'पोस्ट',
    delete: 'हटाएं',
    
    // Map View
    issueMap: 'समस्या मानचित्र',
    searchIssues: 'समस्याएं खोजें...',
    allIssues: 'सभी समस्याएं',
    open: 'खुला',
    inProgress: 'प्रगति में',
    resolved: 'हल हो गया',
    pending: 'लंबित',
    completed: 'पूर्ण',
    reports: 'रिपोर्ट्स',
    loadingReports: 'रिपोर्ट्स लोड हो रही हैं...',
    reportsAtLocation: 'इस स्थान पर रिपोर्ट्स',
    department: 'विभाग',
    status: 'स्थिति',
    reported: 'रिपोर्ट किया गया',
    
    // Report Modal
    briefDescription: 'समस्या का संक्षिप्त विवरण',
    selectCategory: 'श्रेणी चुनें',
    detailedDescription: 'विस्तृत विवरण',
    addressLandmark: 'पता या मील का पत्थर',
    photosMax: 'फोटो (अधिकतम 5)',
    tapToAdd: 'फोटो जोड़ने के लिए टैप करें',
    maxPhotosReached: 'अधिकतम 5 फोटो पहुंच गई',
    photosCount: 'फोटो',
    remove: 'हटाएं',
    
    // Database Viewer
    databaseViewer: 'डेटाबेस व्यूअर',
    realTimeData: 'रियल-टाइम डेटाबेस निगरानी',
    refreshData: 'डेटा रीफ्रेश करें',
    totalReports: 'कुल रिपोर्ट्स',
    totalUsers: 'कुल उपयोगकर्ता',
    activeReports: 'सक्रिय रिपोर्ट्स',
    resolvedReports: 'हल की गई रिपोर्ट्स',
    recentReports: 'हाल की रिपोर्ट्स',
    userManagement: 'उपयोगकर्ता प्रबंधन',
    reportManagement: 'रिपोर्ट प्रबंधन',
    
    // Helpline
    helpline: 'आपातकालीन हेल्पलाइन',
    emergencyContacts: 'आपातकालीन संपर्क',
    police: 'पुलिस',
    fire: 'अग्निशमन विभाग',
    ambulance: 'एम्बुलेंस',
    disaster: 'आपदा प्रबंधन',
    women: 'महिला हेल्पलाइन',
    child: 'बाल हेल्पलाइन',
    call: 'कॉल करें',
    
    // Statistics
    statistics: 'आंकड़े',
    analyticsOverview: 'विश्लेषण अवलोकन',
    thisMonth: 'इस महीने',
    thisWeek: 'इस सप्ताह',
    today: 'आज',
    trendingIssues: 'ट्रेंडिंग मुद्दे',
    departmentPerformance: 'विभाग प्रदर्शन',
    responseTime: 'प्रतिक्रिया समय',
    resolutionRate: 'समाधान दर'
  },
  
  // Santali (Ol Chiki script)
  sat: {
    // Header
    appName: 'ᱞᱚᱠᱥᱮᱛᱩ',
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
    issues: 'ᱵᱟᱝ ᱵᱟᱰᱟᱭ',
    
    // Community Feed
    communityFeed: 'ᱜᱚᱴᱟ ᱯᱷᱤᱰ',
    stayUpdated: 'ᱟᱢᱟᱜ ᱜᱚᱴᱟ ᱥᱟᱶᱛᱮ ᱱᱟᱶᱟ ᱠᱚ ᱵᱟᱰᱟᱭ ᱢᱮ',
    welcome: 'ᱡᱚᱦᱟᱨ',
    logout: 'ᱵᱟᱦᱨᱮ ᱚᱰᱚᱠ',
    elevateRole: 'ᱪᱟᱹᱠᱨᱤ ᱞᱟᱹᱴᱩ',
    sysAdmin: 'ᱥᱤᱥᱴᱚᱢ ᱮᱰᱢᱤᱱ (ᱵᱟᱦᱨᱮ ᱚᱰᱚᱠ ᱞᱟᱹᱜᱤᱫ ᱚᱛᱮ)',
    exitAdminMode: 'ᱥᱤᱥᱴᱚᱢ ᱮᱰᱢᱤᱱ ᱢᱚᱰ ᱠᱷᱚᱱ ᱵᱟᱦᱨᱮ ᱚᱰᱚᱠᱟ?',
    exitedAdminMode: 'ᱮᱰᱢᱤᱱ ᱢᱚᱰ ᱠᱷᱚᱱ ᱵᱟᱦᱨᱮ ᱚᱰᱚᱠ ᱮᱱᱟ᱾ ᱱᱤᱛᱚᱜ ᱟᱢ ᱢᱤᱫ ᱥᱟᱫᱷᱟᱨᱚᱱ ᱵᱮᱵᱷᱟᱨᱤᱭᱟᱹ ᱠᱟᱱᱟᱢ᱾',
    roleElevated: 'ᱪᱟᱹᱠᱨᱤ ᱥᱤᱥᱴᱚᱢ ᱮᱰᱢᱤᱱ ᱦᱟᱹᱵᱤᱡ ᱞᱟᱹᱴᱩ ᱮᱱᱟ! ᱱᱤᱛᱚᱜ ᱟᱢ ᱜᱚᱴᱟ ᱯᱚᱥᱴ ᱚᱪᱚᱜ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ᱾',
    invalidPassword: 'ᱵᱷᱩᱞ ᱯᱟᱥᱣᱟᱨᱰ᱾ ᱵᱚᱞᱚ ᱵᱟᱝ ᱮᱢ ᱟᱠᱟᱱᱟ᱾',
    accessDenied: 'ᱵᱚᱞᱚ ᱵᱟᱝ ᱮᱢ ᱟᱠᱟᱱᱟ᱾ ᱠᱷᱟᱹᱞᱤ ᱥᱤᱥᱴᱚᱢ ᱮᱰᱢᱤᱱ ᱜᱮ ᱯᱚᱥᱴ ᱚᱪᱚᱜ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ᱾',
    confirmDelete: 'ᱪᱮᱫ ᱟᱢ ᱥᱟᱹᱨᱤ ᱜᱮ ᱱᱚᱶᱟ ᱯᱚᱥᱴ ᱚᱪᱚᱜ ᱥᱟᱱᱟᱢ ᱠᱟᱱᱟ? ᱱᱚᱶᱟ ᱠᱟᱹᱢᱤ ᱫᱚ ᱵᱟᱝ ᱨᱩᱣᱟᱹᱲ ᱜᱟᱱᱚᱜᱼᱟ᱾',
    postDeleted: 'ᱯᱚᱥᱴ ᱫᱚ ᱰᱮᱴᱟᱵᱮᱥ ᱠᱷᱚᱱ ᱵᱮᱥ ᱛᱮ ᱚᱪᱚᱜ ᱮᱱᱟ᱾',
    demoPostRemoved: 'ᱰᱮᱢᱚ ᱯᱚᱥᱴ ᱫᱚ ᱞᱚᱠᱟᱞ ᱨᱮ ᱚᱪᱚᱜ ᱮᱱᱟ᱾',
    votes: 'ᱵᱷᱚᱴ',
    addComment: 'ᱢᱚᱱᱛᱚ ᱥᱮᱞᱮᱫ ᱢᱮ...',
    post: 'ᱯᱚᱥᱴ',
    delete: 'ᱚᱪᱚᱜ',
    
    // Map View
    issueMap: 'ᱵᱟᱝ ᱵᱟᱰᱟᱭ ᱱᱚᱠᱥᱟ',
    searchIssues: 'ᱵᱟᱝ ᱵᱟᱰᱟᱭ ᱠᱚ ᱯᱟᱱᱛᱮ...',
    allIssues: 'ᱡᱚᱛᱚ ᱵᱟᱝ ᱵᱟᱰᱟᱭ',
    open: 'ᱠᱷᱩᱞᱟᱹ',
    inProgress: 'ᱠᱟᱹᱢᱤ ᱪᱟᱹᱞᱩ',
    resolved: 'ᱦᱚᱞ ᱮᱱᱟ',
    pending: 'ᱵᱟᱹᱠᱤ',
    completed: 'ᱯᱩᱨᱟᱹᱣ',
    reports: 'ᱨᱤᱯᱚᱨᱴ ᱠᱚ',
    loadingReports: 'ᱨᱤᱯᱚᱨᱴ ᱠᱚ ᱞᱚᱰ ᱦᱩᱭᱩᱜ ᱠᱟᱱᱟ...',
    reportsAtLocation: 'ᱱᱚᱶᱟ ᱡᱟᱭᱜᱟ ᱨᱮ ᱨᱤᱯᱚᱨᱴ ᱠᱚ',
    department: 'ᱵᱤᱵᱷᱟᱜᱽ',
    status: 'ᱚᱵᱚᱥᱛᱟ',
    reported: 'ᱨᱤᱯᱚᱨᱴ ᱮᱱᱟ',
    
    // Report Modal
    briefDescription: 'ᱵᱟᱝ ᱵᱟᱰᱟᱭ ᱨᱮᱱᱟᱜ ᱠᱷᱟᱴᱚ ᱞᱟᱹᱭ',
    selectCategory: 'ᱛᱷᱚᱠ ᱵᱟᱪᱷᱟᱣ ᱢᱮ',
    detailedDescription: 'ᱯᱩᱨᱟᱹᱣ ᱞᱟᱹᱭ',
    addressLandmark: 'ᱴᱷᱤᱠᱟᱹᱱᱟ ᱟᱨ ᱪᱤᱱᱦᱟᱹ',
    photosMax: 'ᱪᱤᱛᱟᱹᱨ (ᱡᱚᱛᱚ ᱠᱷᱚᱱ ᱵᱟᱹᱲᱛᱤ 5)',
    tapToAdd: 'ᱪᱤᱛᱟᱹᱨ ᱥᱮᱞᱮᱫ ᱞᱟᱹᱜᱤᱫ ᱚᱛᱮ ᱢᱮ',
    maxPhotosReached: 'ᱡᱚᱛᱚ ᱠᱷᱚᱱ ᱵᱟᱹᱲᱛᱤ 5 ᱪᱤᱛᱟᱹᱨ ᱯᱩᱨᱟᱹᱣ',
    photosCount: 'ᱪᱤᱛᱟᱹᱨ',
    remove: 'ᱚᱪᱚᱜ',
    
    // Database Viewer
    databaseViewer: 'ᱰᱮᱴᱟᱵᱮᱥ ᱧᱮᱞᱤᱭᱟᱹ',
    realTimeData: 'ᱱᱤᱛᱚᱜ ᱚᱠᱛᱚ ᱰᱮᱴᱟᱵᱮᱥ ᱧᱮᱞ ᱫᱚᱦᱚ',
    refreshData: 'ᱰᱮᱴᱟ ᱱᱟᱶᱟ ᱢᱮ',
    totalReports: 'ᱡᱚᱛᱚ ᱨᱤᱯᱚᱨᱴ',
    totalUsers: 'ᱡᱚᱛᱚ ᱵᱮᱵᱷᱟᱨᱤᱭᱟᱹ',
    activeReports: 'ᱠᱟᱹᱢᱤᱭᱟᱜ ᱨᱤᱯᱚᱨᱴ',
    resolvedReports: 'ᱦᱚᱞ ᱟᱠᱟᱱ ᱨᱤᱯᱚᱨᱴ',
    recentReports: 'ᱱᱟᱶᱟ ᱨᱤᱯᱚᱨᱴ ᱠᱚ',
    userManagement: 'ᱵᱮᱵᱷᱟᱨᱤᱭᱟᱹ ᱵᱮᱵᱚᱥᱛᱟ',
    reportManagement: 'ᱨᱤᱯᱚᱨᱴ ᱵᱮᱵᱚᱥᱛᱟ',
    
    // Helpline
    helpline: 'ᱟᱯᱟᱛ ᱦᱮᱞᱯᱞᱟᱭᱤᱱ',
    emergencyContacts: 'ᱟᱯᱟᱛ ᱥᱚᱢᱯᱚᱨᱠ',
    police: 'ᱯᱩᱞᱤᱥ',
    fire: 'ᱟᱜ ᱵᱤᱵᱷᱟᱜᱽ',
    ambulance: 'ᱮᱢᱵᱩᱞᱮᱱᱥ',
    disaster: 'ᱟᱯᱟᱫ ᱵᱮᱵᱚᱥᱛᱟ',
    women: 'ᱛᱤᱨᱞᱟᱹ ᱦᱮᱞᱯᱞᱟᱭᱤᱱ',
    child: 'ᱜᱤᱫᱽᱨᱟᱹ ᱦᱮᱞᱯᱞᱟᱭᱤᱱ',
    call: 'ᱠᱚᱞ',
    
    // Statistics
    statistics: 'ᱞᱮᱠᱷᱟ ᱡᱚᱠᱷᱟ',
    analyticsOverview: 'ᱵᱤᱥᱞᱮᱥᱚᱱ ᱧᱮᱞ',
    thisMonth: 'ᱱᱚᱶᱟ ᱪᱟᱸᱫᱚ',
    thisWeek: 'ᱱᱚᱶᱟ ᱦᱟᱯᱛᱟ',
    today: 'ᱛᱮᱦᱮᱧ',
    trendingIssues: 'ᱪᱟᱹᱞᱩ ᱵᱟᱝ ᱵᱟᱰᱟᱭ',
    departmentPerformance: 'ᱵᱤᱵᱷᱟᱜᱽ ᱠᱟᱹᱢᱤ',
    responseTime: 'ᱛᱮᱞᱟ ᱚᱠᱛᱚ',
    resolutionRate: 'ᱦᱚᱞ ᱫᱚᱨ'
  },
  
  // Ho (Warang Citi script)
  hoc: {
    // Header
    appName: '𑣇𑣋𑣇𑣑𑣋𑣇𑣩',
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
    issues: '𑣎𑣋𑣒',
    
    // Community Feed
    communityFeed: '𑣑𑣋𑣇𑣋 𑣇𑣂𑣇',
    stayUpdated: '𑣋𑣎𑣒 𑣑𑣋𑣇𑣋 𑣑𑣋𑣇 𑣒𑣋𑣇𑣋 𑣔𑣋𑣍',
    welcome: '𑣑𑣋𑣇𑣋𑣔',
    logout: '𑣇𑣋𑣔 𑣋𑣇',
    elevateRole: '𑣇𑣋𑣔 𑣇𑣋𑣇𑣋',
    sysAdmin: '𑣑𑣂𑣑𑣂𑣇 𑣋𑣇𑣋𑣔 (𑣇𑣋𑣔 𑣇𑣋 𑣋𑣇)',
    exitAdminMode: '𑣑𑣂𑣑𑣂𑣇 𑣋𑣇𑣋𑣔 𑣔𑣋 𑣇𑣋𑣔 𑣋𑣇?',
    exitedAdminMode: '𑣋𑣇𑣋𑣔 𑣔𑣋 𑣇𑣋𑣔 𑣋𑣇 𑣋𑣒𑣋। 𑣒𑣂𑣇 𑣋𑣎 𑣋𑣇 𑣑𑣋𑣇𑣋𑣔𑣒 𑣇𑣋𑣇𑣋𑣔 𑣇𑣋𑣒।',
    roleElevated: '𑣇𑣋𑣔 𑣑𑣂𑣑𑣂𑣇 𑣋𑣇𑣋𑣔 𑣇𑣋𑣇 𑣋𑣒𑣋! 𑣒𑣂𑣇 𑣋𑣎 𑣑𑣋𑣇𑣋 𑣎𑣋𑣑𑣂𑣇 𑣇𑣋𑣇 𑣇𑣋𑣔𑣋𑣇 𑣇𑣋𑣒।',
    invalidPassword: '𑣇𑣋𑣇 𑣎𑣋𑣑𑣋𑣔𑣂𑣇। 𑣇𑣋𑣔 𑣒𑣋 𑣋𑣎 𑣋𑣒𑣋।',
    accessDenied: '𑣇𑣋𑣔 𑣒𑣋 𑣋𑣎 𑣋𑣒𑣋। 𑣇𑣋𑣇 𑣑𑣂𑣑𑣂𑣇 𑣋𑣇𑣋𑣔 𑣎𑣋𑣑𑣂𑣇 𑣇𑣋𑣇 𑣇𑣋𑣔𑣋𑣇 𑣇𑣋𑣒।',
    confirmDelete: '𑣇𑣋 𑣋𑣎 𑣑𑣋𑣔𑣂 𑣒𑣂𑣇 𑣎𑣋𑣑𑣂𑣇 𑣇𑣋𑣇 𑣇𑣋𑣔𑣋𑣇 𑣇𑣋𑣒? 𑣒𑣂𑣇 𑣇𑣋𑣔 𑣇𑣋 𑣔𑣋𑣇 𑣒𑣋 𑣇𑣋𑣔𑣋𑣇 𑣇𑣋𑣒।',
    postDeleted: '𑣎𑣋𑣑𑣂𑣇 𑣇𑣋𑣇 𑣇𑣋𑣇𑣋𑣇𑣋𑣑 𑣇𑣋𑣇 𑣇𑣋𑣇 𑣋𑣒𑣋।',
    demoPostRemoved: '𑣇𑣋𑣔 𑣎𑣋𑣑𑣂𑣇 𑣑𑣋𑣒 𑣔𑣋 𑣇𑣋𑣇 𑣋𑣒𑣋।',
    votes: '𑣋𑣇',
    addComment: '𑣔𑣂𑣎𑣂𑣇 𑣇𑣋𑣇...',
    post: '𑣎𑣋𑣑𑣂𑣇',
    delete: '𑣇𑣋𑣇',
    
    // Map View
    issueMap: '𑣎𑣋𑣒 𑣒𑣋𑣎',
    searchIssues: '𑣎𑣋𑣒 𑣇𑣋𑣇...',
    allIssues: '𑣑𑣋𑣇𑣋 𑣎𑣋𑣒',
    open: '𑣇𑣋𑣇',
    inProgress: '𑣇𑣋𑣔 𑣇𑣋𑣇',
    resolved: '𑣇𑣋𑣇 𑣋𑣒𑣋',
    pending: '𑣇𑣋𑣇𑣂',
    completed: '𑣇𑣋𑣔 𑣋𑣒𑣋',
    reports: '𑣔𑣂𑣎𑣋𑣔𑣂𑣇 𑣇𑣋',
    loadingReports: '𑣔𑣂𑣎𑣋𑣔𑣂𑣇 𑣇𑣋 𑣇𑣋𑣇 𑣔𑣋𑣇...',
    reportsAtLocation: '𑣒𑣂𑣇 𑣇𑣋𑣎𑣋 𑣔𑣋 𑣔𑣂𑣎𑣋𑣔𑣂𑣇 𑣇𑣋',
    department: '𑣇𑣂𑣇𑣋𑣎',
    status: '𑣋𑣇𑣑𑣂𑣇',
    reported: '𑣔𑣂𑣎𑣋𑣔𑣂𑣇 𑣋𑣒𑣋',
    
    // Report Modal
    briefDescription: '𑣎𑣋𑣒 𑣔𑣋 𑣑𑣋𑣇𑣋 𑣇𑣋𑣇',
    selectCategory: '𑣇𑣋𑣔 𑣇𑣋𑣇 𑣇𑣋',
    detailedDescription: '𑣑𑣋𑣇𑣋 𑣇𑣋𑣇',
    addressLandmark: '𑣇𑣋𑣎𑣋 𑣋𑣔 𑣇𑣂𑣒𑣋',
    photosMax: '𑣑𑣂𑣇𑣋 (𑣑𑣋𑣇𑣋 𑣇𑣋𑣇 5)',
    tapToAdd: '𑣑𑣂𑣇𑣋 𑣇𑣋𑣇 𑣇𑣋 𑣇𑣂𑣇 𑣇𑣋',
    maxPhotosReached: '𑣑𑣋𑣇𑣋 𑣇𑣋𑣇 5 𑣑𑣂𑣇𑣋 𑣇𑣋𑣔 𑣋𑣒𑣋',
    photosCount: '𑣑𑣂𑣇𑣋',
    remove: '𑣇𑣋𑣇',
    
    // Database Viewer
    databaseViewer: '𑣇𑣋𑣇𑣋𑣇𑣋𑣑 𑣇𑣋𑣇𑣋𑣔',
    realTimeData: '𑣋𑣇 𑣑𑣋𑣒 𑣇𑣋𑣇𑣋𑣇𑣋𑣑 𑣇𑣋𑣇',
    refreshData: '𑣇𑣋𑣇𑣋 𑣒𑣋𑣇𑣋 𑣇𑣋',
    totalReports: '𑣑𑣋𑣇𑣋 𑣔𑣂𑣎𑣋𑣔𑣂𑣇',
    totalUsers: '𑣑𑣋𑣇𑣋 𑣇𑣋𑣇𑣋𑣔 𑣇𑣋',
    activeReports: '𑣇𑣋𑣔 𑣔𑣂𑣎𑣋𑣔𑣂𑣇',
    resolvedReports: '𑣇𑣋𑣇 𑣋𑣒𑣋 𑣔𑣂𑣎𑣋𑣔𑣂𑣇',
    recentReports: '𑣒𑣋𑣇𑣋 𑣔𑣂𑣎𑣋𑣔𑣂𑣇 𑣇𑣋',
    userManagement: '𑣇𑣋𑣇𑣋𑣔 𑣇𑣋 𑣇𑣋𑣇𑣑𑣇',
    reportManagement: '𑣔𑣂𑣎𑣋𑣔𑣂𑣇 𑣇𑣋𑣇𑣑𑣇',
    
    // Helpline
    helpline: '𑣋𑣎𑣋𑣇 𑣍𑣋𑣇𑣂𑣎𑣇𑣋𑣇',
    emergencyContacts: '𑣋𑣎𑣋𑣇 𑣑𑣋𑣔𑣂𑣇',
    police: '𑣎𑣋𑣇𑣂𑣑',
    fire: '𑣋𑣎 𑣇𑣂𑣇𑣋𑣎',
    ambulance: '𑣋𑣔𑣂𑣇𑣋𑣒𑣂𑣑',
    disaster: '𑣋𑣎𑣋𑣇 𑣇𑣋𑣇𑣑𑣇',
    women: '𑣋𑣔𑣋 𑣍𑣋𑣇𑣂𑣎𑣇𑣋𑣇',
    child: '𑣇𑣋𑣇 𑣍𑣋𑣇𑣂𑣎𑣇𑣋𑣇',
    call: '𑣇𑣋𑣇',
    
    // Statistics
    statistics: '𑣇𑣋𑣇𑣋 𑣇𑣋𑣇',
    analyticsOverview: '𑣇𑣂𑣑𑣇𑣋𑣑𑣒 𑣇𑣋𑣇',
    thisMonth: '𑣒𑣂𑣇 𑣔𑣋𑣍',
    thisWeek: '𑣒𑣂𑣇 𑣍𑣋𑣇𑣂𑣇',
    today: '𑣒𑣂𑣇',
    trendingIssues: '𑣇𑣋𑣇 𑣎𑣋𑣒',
    departmentPerformance: '𑣇𑣂𑣇𑣋𑣎 𑣇𑣋𑣔',
    responseTime: '𑣇𑣋𑣇 𑣑𑣋𑣒',
    resolutionRate: '𑣇𑣋𑣇 𑣇𑣋𑣔'
  },
  
  // Mundari (Devanagari script)
  unr: {
    // Header
    appName: 'लोकसेतु',
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
    issues: 'बाङ्',
    
    // Community Feed
    communityFeed: 'गोटा फीड',
    stayUpdated: 'आपेयाक् गोटा साङ्गे नावा कुली बाडाय् मे',
    welcome: 'जोहार',
    logout: 'बाहरे ओडोक्',
    elevateRole: 'चाकरी लाटु',
    sysAdmin: 'सिस्टम एडमिन (बाहरे ओडोक् लागित् ओते)',
    exitAdminMode: 'सिस्टम एडमिन मोड खोन बाहरे ओडोकाक्?',
    exitedAdminMode: 'एडमिन मोड खोन बाहरे ओडोक् एना। नित्तुक् आम मित् साधारण बेभारिया कानाम्।',
    roleElevated: 'चाकरी सिस्टम एडमिन हाबिज लाटु एना! नित्तुक् आम गोटा पोस्ट ओचोक् दाडेयागा।',
    invalidPassword: 'भुल पासवार्ड। बोलो बाङ् एम अकाना।',
    accessDenied: 'बोलो बाङ् एम अकाना। खाली सिस्टम एडमिन गे पोस्ट ओचोक् दाडेयागा।',
    confirmDelete: 'चेद आम सारी गे नावा पोस्ट ओचोक् सानाम कानाम्? नावा कामी दो बाङ् रुवाड गानोगा।',
    postDeleted: 'पोस्ट दो डेटाबेस खोन बेस ते ओचोक् एना।',
    demoPostRemoved: 'डेमो पोस्ट दो लोकाल रे ओचोक् एना।',
    votes: 'भोट',
    addComment: 'मोनतो सेलेद मे...',
    post: 'पोस्ट',
    delete: 'ओचोक्',
    
    // Map View
    issueMap: 'बाङ् नक्सा',
    searchIssues: 'बाङ् कुली पानते...',
    allIssues: 'जोतो बाङ्',
    open: 'खुला',
    inProgress: 'कामी चालु',
    resolved: 'हल एना',
    pending: 'बाकी',
    completed: 'पुराव',
    reports: 'रिपोर्ट कुली',
    loadingReports: 'रिपोर्ट कुली लोड हुयुग कानाम्...',
    reportsAtLocation: 'नावा जागा रे रिपोर्ट कुली',
    department: 'बिभाग्',
    status: 'ओबोस्ता',
    reported: 'रिपोर्ट एना',
    
    // Report Modal
    briefDescription: 'बाङ् रेयाक् खाटो लाय',
    selectCategory: 'थोक बाचाव मे',
    detailedDescription: 'पुराव लाय',
    addressLandmark: 'ठिकाना आर चिन्हा',
    photosMax: 'चित्र (जोतो खोन बाडती 5)',
    tapToAdd: 'चित्र सेलेद लागित् ओते मे',
    maxPhotosReached: 'जोतो खोन बाडती 5 चित्र पुराव',
    photosCount: 'चित्र',
    remove: 'ओचोक्',
    
    // Database Viewer
    databaseViewer: 'डेटाबेस नेलिया',
    realTimeData: 'नित्तुक् ओक्तो डेटाबेस नेल दोहो',
    refreshData: 'डेटा नावा मे',
    totalReports: 'जोतो रिपोर्ट',
    totalUsers: 'जोतो बेभारिया',
    activeReports: 'कामियाक् रिपोर्ट',
    resolvedReports: 'हल अकान रिपोर्ट',
    recentReports: 'नावा रिपोर्ट कुली',
    userManagement: 'बेभारिया बेबोस्ता',
    reportManagement: 'रिपोर्ट बेबोस्ता',
    
    // Helpline
    helpline: 'आपात हेल्पलाइन',
    emergencyContacts: 'आपात सोम्पोर्क',
    police: 'पुलिस',
    fire: 'आग बिभाग्',
    ambulance: 'एम्बुलेन्स',
    disaster: 'आपाद बेबोस्ता',
    women: 'तिरला हेल्पलाइन',
    child: 'गिद्रा हेल्पलाइन',
    call: 'कल',
    
    // Statistics
    statistics: 'लेखा जोखा',
    analyticsOverview: 'बिस्लेसन नेल',
    thisMonth: 'नावा चान्दो',
    thisWeek: 'नावा हाप्ता',
    today: 'तेहेङ',
    trendingIssues: 'चालु बाङ्',
    departmentPerformance: 'बिभाग् कामी',
    responseTime: 'तेला ओक्तो',
    resolutionRate: 'हल दोर'
  }
};

export class I18nService {
  private currentLanguage: string = 'en';
  private listeners: (() => void)[] = [];
  private googleTranslateLoaded = false;
  
  setLanguage(language: string) {
    this.currentLanguage = language;
    localStorage.setItem('selectedLanguage', language);
    
    if (language === 'en') {
      this.removeGoogleTranslate();
    } else {
      this.loadGoogleTranslate(language);
    }
    
    this.listeners.forEach(listener => listener());
  }
  
  private loadGoogleTranslate(targetLanguage: string) {
    if (this.googleTranslateLoaded) {
      this.changeGoogleTranslateLanguage(targetLanguage);
      return;
    }
    
    // Add Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
    
    // Initialize Google Translate
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'hi,bn,te,mr,ta,gu,kn,ml,pa,or,as,ur',
        layout: (window as any).google.translate.TranslateElement.InlineLayout.INVISIBLE,
        autoDisplay: false
      }, 'google_translate_element');
      
      this.googleTranslateLoaded = true;
      setTimeout(() => this.changeGoogleTranslateLanguage(targetLanguage), 1000);
    };
    
    // Add hidden Google Translate element
    if (!document.getElementById('google_translate_element')) {
      const div = document.createElement('div');
      div.id = 'google_translate_element';
      div.style.display = 'none';
      document.body.appendChild(div);
    }
  }
  
  private changeGoogleTranslateLanguage(language: string) {
    const langMap: {[key: string]: string} = {
      'hi': 'hi',
      'bn': 'bn',
      'te': 'te',
      'mr': 'mr',
      'ta': 'ta',
      'gu': 'gu',
      'kn': 'kn',
      'ml': 'ml',
      'pa': 'pa',
      'or': 'or',
      'as': 'as',
      'ur': 'ur',
      'sat': 'hi', // Fallback to Hindi for Santali
      'hoc': 'hi', // Fallback to Hindi for Ho
      'unr': 'hi', // Fallback to Hindi for Mundari
      'kha': 'hi', // Fallback to Hindi for Kharia
      'mjz': 'hi'  // Fallback to Hindi for Majhi
    };
    
    const googleLang = langMap[language] || 'hi';
    
    // Trigger Google Translate
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = googleLang;
      selectElement.dispatchEvent(new Event('change'));
    }
  }
  
  private removeGoogleTranslate() {
    // Reset to original language
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = '';
      selectElement.dispatchEvent(new Event('change'));
    }
  }
  
  addListener(listener: () => void) {
    this.listeners.push(listener);
  }
  
  removeListener(listener: () => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
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
      { code: 'unr', name: 'Mundari', nativeName: 'मुण्डारी' },
      { code: 'kha', name: 'Kharia', nativeName: 'खड़िया' },
      { code: 'mjz', name: 'Majhi', nativeName: 'माझी' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
      { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
      { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
      { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
    ];
  }
  
  t(key: string): string {
    // For Google Translate, return original English text
    return translations.en[key] || key;
  }
  
  initializeLanguage() {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && savedLanguage !== 'en') {
      this.currentLanguage = savedLanguage;
      setTimeout(() => this.loadGoogleTranslate(savedLanguage), 1000);
    }
  }
}

export const i18n = new I18nService();

// Add Google Translate CSS to hide the banner
const style = document.createElement('style');
style.textContent = `
  .goog-te-banner-frame { display: none !important; }
  .goog-te-menu-value { display: none !important; }
  body { top: 0 !important; }
  #google_translate_element { display: none !important; }
`;
document.head.appendChild(style);