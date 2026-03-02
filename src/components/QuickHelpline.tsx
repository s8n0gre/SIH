import React, { useState } from 'react';
import { Phone, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const QuickHelpline: React.FC = () => {
  const [showDirectory, setShowDirectory] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  
  const faqs = [
    {
      question: "How do I report a civic issue?",
      answer: "Tap the '+' button, fill in the details, add photos, and submit. Your report will be forwarded to the relevant department."
    },
    {
      question: "How long does it take to resolve issues?",
      answer: "Resolution time varies by issue type: Emergency (24-48 hours), Infrastructure (1-2 weeks), General maintenance (2-4 weeks)."
    },
    {
      question: "Can I track my report status?",
      answer: "Yes, all reports show status updates: Pending → In Progress → Completed. You'll see real-time updates in the community feed."
    },
    {
      question: "What if my issue is not resolved?",
      answer: "Contact the relevant department directly using numbers in our directory, or escalate through the admin portal if available."
    },
    {
      question: "How do I join other communities?",
      answer: "Tap the community icons next to 'Community Reports' header and browse available communities to join."
    },
    {
      question: "Is my personal information safe?",
      answer: "Yes, we follow strict privacy guidelines. Only your username is visible publicly. Contact details are kept secure."
    }
  ];

  const emergencyNumbers = [
    { name: 'Police', number: '100', color: 'bg-blue-600' },
    { name: 'Fire', number: '101', color: 'bg-red-600' },
    { name: 'Ambulance', number: '108', color: 'bg-green-600' },
    { name: 'Disaster', number: '1077', color: 'bg-orange-600' }
  ];

  const directoryNumbers = [
    { category: 'Municipal Services', numbers: [
      { name: 'Water Supply', number: '1916' },
      { name: 'Electricity Board', number: '1912' },
      { name: 'Municipal Corporation', number: '0651-2446161' },
      { name: 'Waste Management', number: '0651-2446162' }
    ]},
    { category: 'Transport', numbers: [
      { name: 'Railway Enquiry', number: '139' },
      { name: 'Bus Stand', number: '0651-2331234' },
      { name: 'Airport', number: '0651-2782111' },
      { name: 'Taxi Service', number: '0651-2445566' }
    ]},
    { category: 'Healthcare', numbers: [
      { name: 'RIMS Hospital', number: '0651-2451070' },
      { name: 'Sadar Hospital', number: '0651-2331122' },
      { name: 'Blood Bank', number: '0651-2451080' },
      { name: 'Poison Control', number: '1066' }
    ]},
    { category: 'Utilities', numbers: [
      { name: 'Gas Emergency', number: '1906' },
      { name: 'Telecom Fault', number: '198' },
      { name: 'Consumer Forum', number: '1800-11-4000' },
      { name: 'Banking Helpline', number: '1800-425-3800' }
    ]}
  ];

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <Phone className="w-4 h-4 text-red-500" />
        Emergency Helpline
      </h3>
      
      {/* Emergency Numbers */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {emergencyNumbers.map((emergency) => (
          <button
            key={emergency.number}
            onClick={() => handleCall(emergency.number)}
            className={`${emergency.color} text-white p-2 rounded-lg hover:opacity-90 transition-opacity`}
          >
            <div className="text-xs font-medium">{emergency.name}</div>
            <div className="text-sm font-bold">{emergency.number}</div>
          </button>
        ))}
      </div>

      {/* Directory Toggle */}
      <button
        onClick={() => setShowDirectory(!showDirectory)}
        className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">More Numbers</span>
        {showDirectory ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Directory */}
      {showDirectory && (
        <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
          {directoryNumbers.map((category) => (
            <div key={category.category}>
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                {category.category}
              </h4>
              <div className="space-y-1">
                {category.numbers.map((contact) => (
                  <button
                    key={contact.number}
                    onClick={() => handleCall(contact.number)}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <span className="text-xs text-gray-700 dark:text-gray-300">{contact.name}</span>
                    <span className="text-xs font-mono text-blue-600 dark:text-blue-400">{contact.number}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* FAQ Section */}
      <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
        <button
          onClick={() => setShowFAQ(!showFAQ)}
          className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">FAQ & Support</span>
          </div>
          {showFAQ ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {showFAQ && (
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{faq.question}</span>
                    <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {openFAQ === index && (
                  <div className="px-3 pb-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickHelpline;