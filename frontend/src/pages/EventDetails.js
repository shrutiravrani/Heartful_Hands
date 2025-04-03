import EventCompletion from '../components/EventCompletion';

const EventDetails = () => {
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const handleMarkComplete = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowCompletionModal(true);
  };

  const handleCompletionSuccess = (data) => {
    setEvent(prevEvent => ({
      ...prevEvent,
      applicants: prevEvent.applicants.map(applicant => 
        applicant.user._id === selectedVolunteer._id
          ? { ...applicant, status: 'completed' }
          : applicant
      )
    }));
    setShowCompletionModal(false);
    setSelectedVolunteer(null);
    toast.success('Volunteer completion marked successfully');
  };

  return (
    <div>
      {isEventManager && event?.applicants?.map(applicant => (
        <div key={applicant.user._id} className="volunteer-card">
          <div className="volunteer-info">
            <h4>{applicant.user.name}</h4>
            <p>{applicant.user.email}</p>
            <span className={`status ${applicant.status}`}>
              {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
            </span>
          </div>
          {applicant.status === 'active' && (
            <button
              onClick={() => handleMarkComplete(applicant.user)}
              className="mark-complete-btn"
            >
              Mark Complete
            </button>
          )}
        </div>
      ))}

      {showCompletionModal && selectedVolunteer && (
        <Modal
          isOpen={showCompletionModal}
          onClose={() => {
            setShowCompletionModal(false);
            setSelectedVolunteer(null);
          }}
        >
          <EventCompletion
            event={event}
            volunteer={selectedVolunteer}
            onComplete={handleCompletionSuccess}
            onClose={() => {
              setShowCompletionModal(false);
              setSelectedVolunteer(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default EventDetails; 