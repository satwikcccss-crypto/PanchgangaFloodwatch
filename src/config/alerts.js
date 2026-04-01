/**
 * ALERT SYSTEM CONFIGURATION
 * 
 * Instructions for Developer:
 * 1. Create Google Form with fields: Name, Phone, Location, Alert Level, Consent
 * 2. Get shareable link from Google Form
 * 3. Replace 'YOUR_GOOGLE_FORM_ID' with actual form link
 * 4. QR code will automatically generate from this URL
 */

export const ALERT_CONFIG = {
  registrationFormUrl: 'https://forms.gle/GAZjQs2jCN8zafsWA',
  
  qrCode: {
    size: 256,
    level: 'H',
    includeMargin: true,
    fgColor: '#1F2937',
    bgColor: '#FFFFFF'
  },
  
  updateInterval: 60000,
  enableNotifications: true,
  enableSoundAlerts: true,
  enableFlashingAlerts: true,
  
  messageTemplates: {
    warning: {
      en: '⚠️ WARNING: Water level at {location} has reached {level}m MSL. Please stay alert.',
      mr: '⚠️ चेतावणी: {location} येथे पाण्याची पातळी {level} मीटर MSL पर्यंत पोहोचली आहे. कृपया सावध राहा.'
    },
    danger: {
      en: '🚨 DANGER: Critical water level at {location} - {level}m MSL. Prepare for evacuation.',
      mr: '🚨 धोका: {location} येथे गंभीर पाण्याची पातळी - {level} मीटर MSL. स्थलांतरासाठी तयार रहा.'
    },
    extreme: {
      en: '🔴 EXTREME: IMMEDIATE EVACUATION required at {location}. Water level: {level}m MSL. Move to safety NOW!',
      mr: '🔴 अत्यंत धोका: {location} येथे तात्काळ स्थलांतर आवश्यक. पाण्याची पातळी: {level} मीटर MSL. आता सुरक्षित ठिकाणी जा!'
    }
  },
  
  cwcClassification: {
    normal: {
      level: 0,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      label: 'Normal',
      labelMr: 'सामान्य',
      description: 'Water level is within safe limits',
      descriptionMr: 'पाण्याची पातळी सुरक्षित मर्यादेत आहे',
      icon: '✓',
      priority: 0
    },
    warning: {
      level: 1,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      label: 'Warning',
      labelMr: 'चेतावणी',
      description: 'Warning level crossed - Monitor closely',
      descriptionMr: 'चेतावणी पातळी ओलांडली - बारकाईने लक्ष द्या',
      icon: '⚠️',
      priority: 1,
      actions: [
        'Monitor water level continuously',
        'Alert authorities',
        'Prepare emergency contacts'
      ],
      actionsMr: [
        'पाण्याची पातळी सतत पहा',
        'अधिकाऱ्यांना सावध करा',
        'आणीबाणीचे संपर्क तयार ठेवा'
      ]
    },
    danger: {
      level: 2,
      color: '#F97316',
      bgColor: 'rgba(249, 115, 22, 0.1)',
      label: 'Danger',
      labelMr: 'धोका',
      description: 'Danger level crossed - Prepare for evacuation',
      descriptionMr: 'धोक्याची पातळी ओलांडली - स्थलांतरासाठी तयार रहा',
      icon: '🚨',
      priority: 2,
      actions: [
        'Prepare for evacuation',
        'Move valuables to higher ground',
        'Keep emergency kit ready',
        'Stay tuned to updates'
      ],
      actionsMr: [
        'स्थलांतरासाठी तयार रहा',
        'मौल्यवान वस्तू उंच जागी हलवा',
        'आणीबाणी किट तयार ठेवा',
        'अपडेट्स ऐका'
      ]
    },
    extreme: {
      level: 3,
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      label: 'Extreme',
      labelMr: 'अत्यंत धोका',
      description: 'HFL crossed - IMMEDIATE EVACUATION required',
      descriptionMr: 'HFL ओलांडली - तात्काळ स्थलांतर आवश्यक',
      icon: '🔴',
      priority: 3,
      actions: [
        'EVACUATE IMMEDIATELY',
        'Move to designated safe zones',
        'Follow official instructions',
        'Do not return until all-clear'
      ],
      actionsMr: [
        'लगेच स्थलांतर करा',
        'सुरक्षित झोनमध्ये जा',
        'अधिकृत सूचनांचे पालन करा',
        'सर्व-क्लीअर होईपर्यंत परत येऊ नका'
      ]
    }
  },
  
  emergencyContacts: {
    control: {
      name: 'Flood Control Room',
      nameMr: 'पूर नियंत्रण कक्ष',
      phone: '1070',
      available: '24x7'
    },
    police: {
      name: 'Police Control',
      nameMr: 'पोलीस नियंत्रण',
      phone: '100',
      available: '24x7'
    },
    disaster: {
      name: 'Disaster Management',
      nameMr: 'आपत्ती व्यवस्थापन',
      phone: '108',
      available: '24x7'
    },
    wrd: {
      name: 'WRD Maharashtra',
      nameMr: 'जल संसाधन विभाग',
      phone: '022-22027990',
      available: 'Office Hours'
    }
  }
};

// Helper function to determine alert level
export const determineAlertLevel = (currentLevel, dangerLevels) => {
  if (!currentLevel || !dangerLevels) return 'normal';
  if (currentLevel >= dangerLevels.hfl || currentLevel >= dangerLevels.extreme) return 'extreme';
  if (currentLevel >= dangerLevels.danger) return 'danger';
  if (currentLevel >= dangerLevels.warning) return 'warning';
  return 'normal';
};

// Helper function to get alert configuration
export const getAlertConfig = (level) => {
  return ALERT_CONFIG.cwcClassification[level] || ALERT_CONFIG.cwcClassification.normal;
};

// Helper function to format alert message
export const formatAlertMessage = (level, location, waterLevel, language = 'en') => {
  const template = ALERT_CONFIG.messageTemplates[level]?.[language];
  if (!template) return '';
  return template.replace('{location}', location).replace('{level}', waterLevel.toFixed(2));
};

// Check if alert should trigger
export const shouldTriggerAlert = (previousLevel, currentLevel) => {
  const levels = ['normal', 'warning', 'danger', 'extreme'];
  const prevIndex = levels.indexOf(previousLevel);
  const currIndex = levels.indexOf(currentLevel);
  return currIndex > prevIndex;
};
