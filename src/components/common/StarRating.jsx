const StarRating = ({ value = 0, onChange, readOnly = false }) => {
  const rating = Number(value) || 0;

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          disabled={readOnly}
          onClick={() => {
            if (!readOnly && onChange) {
              onChange(score);
            }
          }}
          className={`text-3xl font-black transition ${
            score <= rating ? 'text-yellow-400' : 'text-gray-300'
          } ${readOnly ? 'cursor-default' : 'hover:scale-110'}`}
        >
          ★
        </button>
      ))}

      <span className="ml-2 text-sm font-bold text-gray-600">{rating} / 5</span>
    </div>
  );
};

export default StarRating;
