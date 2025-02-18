import React from 'react';

interface NoteInputProps {
  note: string;
}

const NoteInput: React.FC<NoteInputProps> = ({ note }) => {
  return (
    <div className="note-input">
      <textarea defaultValue={note} />
    </div>
  );
};

export default NoteInput;
