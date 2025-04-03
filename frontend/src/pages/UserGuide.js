import React, { useState } from 'react';
import './UserGuide.css';
import { 
  FaSearch, FaChevronDown, FaChevronUp, FaCalendarAlt, 
  FaUsers, FaComments, FaClipboardCheck,  
    FaChartBar, FaCog, 
   FaUserTie, FaHandshake,
  FaUserGraduate,  FaUserEdit
} from 'react-icons/fa';

const UserGuide = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedRole, setSelectedRole] = useState(user?.role || 'volunteer');

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const eventManagerFeatures = [
    {
      id: 'event-creation',
      title: 'Event Creation and Management',
      icon: <FaCalendarAlt />,
      content: [
        {
          subtitle: 'Event Setup',
          details: [
            'Create detailed event profiles with comprehensive descriptions',
            'Set up event schedules with multiple sessions and time slots',
            'Define specific location details with map integration',
            'Specify required volunteer skills, experience levels, and count',
            'Set event capacity limits and registration deadlines',
            'Configure event categories and tags for better organization',
            'Upload event images, documents, and promotional materials',
            'Set up custom registration forms with required fields'
          ]
        },
        {
          subtitle: 'Event Customization',
          details: [
            'Configure automated notifications and reminders',
            'Set up event-specific communication channels',
            'Create custom event checklists and requirements',
            'Define event-specific rules and guidelines',
            'Set up event-specific feedback forms',
            'Configure event-specific reporting templates'
          ]
        }
      ]
    },
    {
      id: 'volunteer-management',
      title: 'Volunteer Management System',
      icon: <FaUsers />,
      content: [
        {
          subtitle: 'Application Processing',
          details: [
            'Review and evaluate volunteer applications with detailed profiles',
            'Filter applications by skills, experience, and availability',
            'Send automated application status updates',
            'Schedule and manage volunteer interviews',
            'Track application history and status changes',
            'Generate application reports and analytics'
          ]
        },
        {
          subtitle: 'Volunteer Engagement',
          details: [
            'Send personalized welcome packages and orientation materials',
            'Schedule and manage training sessions',
            'Track volunteer attendance and participation records',
            'Manage volunteer feedback and performance ratings',
            'Generate volunteer certificates and recognition',
            'Maintain volunteer communication history'
          ]
        }
      ]
    },
    {
      id: 'communication',
      title: 'Advanced Communication Tools',
      icon: <FaComments />,
      content: [
        {
          subtitle: 'Platform Communication',
          details: [
            'Send targeted messages to specific volunteer groups',
            'Create and manage group announcements',
            'Schedule automated reminders and notifications',
            'Track message delivery and read status',
            'Set up communication templates',
            'Manage communication preferences'
          ]
        },
        {
          subtitle: 'Event Communication',
          details: [
            'Post real-time event updates and changes',
            'Share important documents and resources',
            'Send emergency notifications and alerts',
            'Manage event-specific discussion forums',
            'Create event-specific communication channels',
            'Track communication effectiveness'
          ]
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Comprehensive Analytics',
      icon: <FaChartBar />,
      content: [
        {
          subtitle: 'Event Analytics',
          details: [
            'View detailed event registration trends and patterns',
            'Track volunteer engagement metrics and participation rates',
            'Generate comprehensive attendance reports',
            'Analyze feedback and ratings across events',
            'Monitor event success metrics',
            'Track resource utilization'
          ]
        },
        {
          subtitle: 'Performance Analysis',
          details: [
            'Monitor event success rates and ROI',
            'Track volunteer retention and satisfaction',
            'Generate custom reports and dashboards',
            'Export data for external analysis',
            'Track key performance indicators',
            'Analyze volunteer demographics and trends'
          ]
        }
      ]
    },
    {
      id: 'administration',
      title: 'Administrative Tools',
      icon: <FaCog />,
      content: [
        {
          subtitle: 'System Configuration',
          details: [
            'Configure platform settings and preferences',
            'Manage user roles and permissions',
            'Set up automated workflows',
            'Configure notification systems',
            'Manage system integrations',
            'Set up backup and recovery options'
          ]
        },
        {
          subtitle: 'Document Management',
          details: [
            'Manage event templates and forms',
            'Organize and store event documents',
            'Set up document approval workflows',
            'Manage document access permissions',
            'Track document versions and changes',
            'Generate document reports'
          ]
        }
      ]
    }
  ];

  const volunteerFeatures = [
    {
      id: 'event-discovery',
      title: 'Event Discovery and Search',
      icon: <FaCalendarAlt />,
      content: [
        {
          subtitle: 'Advanced Search',
          details: [
            'Search events by multiple criteria (category, location, date)',
            'Use advanced filters for specific opportunities',
            'Save favorite events and searches',
            'Receive personalized event recommendations',
            'View event popularity and ratings',
            'Track event application deadlines'
          ]
        },
        {
          subtitle: 'Event Information',
          details: [
            'Access comprehensive event descriptions and requirements',
            'View detailed schedules and timelines',
            'Check required skills and qualifications',
            'See event location with map integration',
            'Read past volunteer reviews and ratings',
            'Access event-specific resources'
          ]
        }
      ]
    },
    {
      id: 'profile-management',
      title: 'Profile and Portfolio Management',
      icon: <FaUserEdit />,
      content: [
        {
          subtitle: 'Profile Enhancement',
          details: [
            'Create detailed professional profiles',
            'Upload certificates and qualifications',
            'Add skills and expertise areas',
            'Manage availability calendar',
            'Track volunteer hours and achievements',
            'Build comprehensive volunteer portfolio'
          ]
        },
        {
          subtitle: 'Application Management',
          details: [
            'Submit detailed event applications',
            'Track application status and history',
            'Receive application updates and notifications',
            'Manage multiple event applications',
            'View application feedback and ratings',
            'Generate application reports'
          ]
        }
      ]
    },
    {
      id: 'event-participation',
      title: 'Event Participation Tools',
      icon: <FaClipboardCheck />,
      content: [
        {
          subtitle: 'Event Engagement',
          details: [
            'Receive automated event reminders',
            'Access event materials and resources',
            'Check-in and check-out at events',
            'Submit attendance confirmation',
            'Access event schedules and updates',
            'View event-specific instructions'
          ]
        },
        {
          subtitle: 'Post-Event Activities',
          details: [
            'Submit detailed event feedback',
            'Share event photos and stories',
            'Receive certificates of participation',
            'Track volunteer hours and achievements',
            'Rate event experiences',
            'Share success stories'
          ]
        }
      ]
    },
    {
      id: 'communication',
      title: 'Communication Features',
      icon: <FaComments />,
      content: [
        {
          subtitle: 'Platform Communication',
          details: [
            'Chat with event managers and coordinators',
            'Receive event notifications and updates',
            'Join event-specific discussions',
            'Share updates with other volunteers',
            'Access communication history',
            'Manage notification preferences'
          ]
        },
        {
          subtitle: 'Community Engagement',
          details: [
            'Connect with other volunteers',
            'Share experiences and tips',
            'Participate in volunteer forums',
            'Receive community updates',
            'Join volunteer groups',
            'Share success stories'
          ]
        }
      ]
    },
    {
      id: 'training',
      title: 'Training and Development',
      icon: <FaUserGraduate />,
      content: [
        {
          subtitle: 'Learning Resources',
          details: [
            'Access training materials and guides',
            'Complete online training modules',
            'Track training progress and completion',
            'Receive certificates for completed training',
            'Access skill development resources',
            'View recommended learning paths'
          ]
        },
        {
          subtitle: 'Career Development',
          details: [
            'Track volunteer experience and skills',
            'Build professional portfolio',
            'Receive career guidance',
            'Access mentorship opportunities',
            'Track achievements and milestones',
            'Generate experience reports'
          ]
        }
      ]
    }
  ];

  const features = selectedRole === 'event_manager' ? eventManagerFeatures : volunteerFeatures;

  const filteredFeatures = features.filter(feature =>
    feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.content.some(section =>
      section.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.details.some(detail =>
        detail.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  );

  return (
    <div className="user-guide-container">
      <div className="guide-header">
        <h1>Comprehensive User Guide</h1>
        <div className="role-selector">
          <button 
            className={`role-button ${selectedRole === 'event_manager' ? 'active' : ''}`}
            onClick={() => setSelectedRole('event_manager')}
          >
            <FaUserTie /> Event Manager Guide
          </button>
          <button 
            className={`role-button ${selectedRole === 'volunteer' ? 'active' : ''}`}
            onClick={() => setSelectedRole('volunteer')}
          >
            <FaHandshake /> Volunteer Guide
          </button>
          </div>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="features-grid">
        {filteredFeatures.map((feature) => (
          <div key={feature.id} className="feature-card">
            <div 
              className="feature-header"
              onClick={() => toggleSection(feature.id)}
            >
              <div className="feature-title">
                <span className="feature-icon">{feature.icon}</span>
                <h2>{feature.title}</h2>
              </div>
              {expandedSections[feature.id] ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            
            {expandedSections[feature.id] && (
              <div className="feature-content">
                {feature.content.map((section, index) => (
                  <div key={index} className="feature-section">
                    <h3>{section.subtitle}</h3>
                    <ul>
                      {section.details.map((detail, detailIndex) => (
                        <li key={detailIndex}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        </div>
    </div>
  );
};

export default UserGuide; 