import React, { useState } from 'react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';

interface BookmarkButtonProps {
  questionId: string; // Prop type definition for questionId
}

const BookmarkButton = ({ questionId }: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmarkToggle = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevents the click event from propagating to the parent div
    setIsBookmarked(prevState => !prevState);
    // Add logic to update the bookmark status in the database
  };

  return (
    <button onClick={handleBookmarkToggle} className='bookmark-button'>
      {isBookmarked ? <FaBookmark size={24} /> : <FaRegBookmark size={24} />}
    </button>
  );
};

export default BookmarkButton;
