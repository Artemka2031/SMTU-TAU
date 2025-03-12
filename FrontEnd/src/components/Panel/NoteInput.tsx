import React from 'react';

interface NoteInputProps {
  note: string;
  onChangeNote: (newNote: string) => void;
}

const NoteInput: React.FC<NoteInputProps> = ({ note, onChangeNote }) => {
  return (
    <div className="note-input">
      <textarea
        value={note}
        onChange={(e) => onChangeNote(e.target.value)}
        rows={3}
      />
    </div>
  );
};

export default NoteInput;
