// src/pages/CreateCourse.js

import React, { useState } from 'react';
import { HiOutlineDocument, HiOutlineLightBulb, HiOutlinePhotograph, HiOutlineVideoCamera } from 'react-icons/hi';
import './CreateCourse.css';

const CreateCourse = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionSelect = (option) => {
    setSelectedOption(option === selectedOption ? null : option);
  };

  const renderOption = (option, Icon) => (
    <div
      key={option}
      className={`option ${option === selectedOption ? 'selected' : ''}`}
      onClick={() => handleOptionSelect(option)}
    >
      <Icon className="option-icon" />
      <p>{option}</p>
    </div>
  );

  return (
    <div className="create-course-container">
      <h1>Create Your Course</h1>
      <div className="options-container">
        {renderOption('Quiz', HiOutlineLightBulb)}
        {renderOption('Video', HiOutlineVideoCamera)}
        {renderOption('Document', HiOutlineDocument)}
        {renderOption('Story', HiOutlinePhotograph)}
      </div>
      <button className="create-button" disabled={!selectedOption}>
        Add Activity
      </button>
    </div>
  );
};

export default CreateCourse;
