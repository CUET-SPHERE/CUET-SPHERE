import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { mockResources as initialMockResources } from '../mock/mockResources';
import ResourceUploadModal from './ResourceUploadModal';

const levels = [1, 2, 3, 4];
const terms = [1, 2];
const coursesByLevelTerm = {
  1: {
    1: [
      'Mathematics I', 'Physics I', 'Chemistry', 'English', 'Programming', 'Engineering Drawing', 'Basic Electronics', 'Mechanics'
    ],
    2: [
      'Mathematics II', 'Physics II', 'Electrical Circuits', 'Digital Logic', 'Data Structures', 'Computer Organization', 'Linear Algebra', 'Calculus'
    ]
  },
  2: {
    1: [
      'Algorithms', 'Database Systems', 'Computer Networks', 'Operating Systems', 'Software Engineering', 'Web Programming', 'Computer Graphics', 'Discrete Math'
    ],
    2: [
      'Machine Learning', 'Artificial Intelligence', 'Compiler Design', 'Computer Architecture', 'Distributed Systems', 'Mobile Computing', 'Cybersecurity', 'Data Mining'
    ]
  },
  3: {
    1: [
      'Advanced Algorithms', 'System Analysis', 'Project Management', 'Advanced Database', 'Network Security', 'Cloud Computing', 'Big Data', 'IoT Systems'
    ],
    2: [
      'Deep Learning', 'Computer Vision', 'Natural Language Processing', 'Robotics', 'Quantum Computing', 'Blockchain', 'Advanced AI', 'Research Methodology'
    ]
  },
  4: {
    1: [
      'Thesis/Project I', 'Advanced Software Engineering', 'Ethics in Computing', 'Entrepreneurship', 'Advanced Security', 'High Performance Computing', 'Bioinformatics'
    ],
    2: [
      'Thesis/Project II', 'Industry Internship', 'Capstone Project', 'Professional Development', 'Advanced Research', 'Innovation Lab'
    ]
  }
};

function AcademicResources() {
  const { user } = useUser();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedTerm, setSelectedTerm] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [resources, setResources] = useState(initialMockResources);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // For modal context
  const [modalCourse, setModalCourse] = useState(null);
  const [modalLevel, setModalLevel] = useState(null);
  const [modalTerm, setModalTerm] = useState(null);

  // Filter resources for the current user, level, term, course
  const getResources = (course) =>
    resources.filter(
      (r) =>
        r.department === user.department &&
        r.batch === user.batch &&
        r.level === selectedLevel &&
        r.term === selectedTerm &&
        r.course === course
    );

  // Handle upload (mock: add to local state)
  const handleUpload = (newRes) => {
    setResources([
      ...resources,
      {
        id: resources.length + 1,
        department: user.department,
        batch: user.batch,
        level: newRes.level,
        term: newRes.term,
        course: newRes.course,
        title: newRes.title,
        file: newRes.file,
        uploader: user.email,
        downloadCount: 0,
      },
    ]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6 shrink-0">Academic Resources</h2>
      
      <div className="flex flex-col gap-6 flex-grow">
        {/* Levels */}
        <div className="grid grid-cols-5 items-center gap-4">
          <h3 className="font-semibold text-gray-600 col-span-1">Levels</h3>
          <div className="col-span-4 grid grid-cols-4 gap-2">
            {levels.map((level) => (
              <button
                key={level}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedLevel === level ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => {
                  setSelectedLevel(level);
                  setSelectedTerm(1);
                  setSelectedCourse(null);
                }}
              >
                Level {level}
              </button>
            ))}
          </div>
        </div>

        {/* Term selector & Courses */}
        <div className="w-full">
          {!selectedCourse ? (
            <>
              <div className="flex gap-4 mb-4">
                {terms.map((term) => (
                  <button
                    key={term}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedTerm === term
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => {
                      setSelectedTerm(term);
                      setSelectedCourse(null);
                    }}
                  >
                    Term {term}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {coursesByLevelTerm[selectedLevel][selectedTerm].map((course) => (
                  <button
                    key={course}
                    className="p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-all text-left font-semibold"
                    onClick={() => setSelectedCourse(course)}
                  >
                    {course}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Level {selectedLevel} - Term {selectedTerm} - {selectedCourse}</h3>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => setSelectedCourse(null)}
                >
                  &larr; Back to Courses
                </button>
              </div>
              {/* Resource List */}
              <div className="mb-4">
                {getResources(selectedCourse).length === 0 ? (
                  <p className="text-gray-500">No resources uploaded yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {getResources(selectedCourse).map((res) => (
                      <li key={res.id} className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                        <div>
                          <div className="font-medium">{res.title}</div>
                          <div className="text-xs text-gray-500">Uploaded by: {res.uploader}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-600">Downloads: {res.downloadCount}</span>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all text-sm">Download</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Upload Button for CRs */}
              {user && user.role === 'CR' && (
                <>
                  <button
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all"
                    onClick={() => {
                      setModalCourse(selectedCourse);
                      setModalLevel(selectedLevel);
                      setModalTerm(selectedTerm);
                      setShowUploadModal(true);
                    }}
                  >
                    Upload Resource
                  </button>
                  <ResourceUploadModal
                    open={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    onUpload={handleUpload}
                    course={modalCourse}
                    level={modalLevel}
                    term={modalTerm}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AcademicResources;
