import ReactMarkdown from "react-markdown";

function QuizQuestion({ index, data, selected, onSelect, result }) {
  return (
    <fieldset className="border rounded-lg p-4 space-y-3 min-w-0">
      <legend className="px-1 text-sm text-muted-foreground">
        Question {index + 1} · page {data.page}
      </legend>

      <div className="prose prose-sm max-w-none min-w-0">
        <ReactMarkdown>{data.question}</ReactMarkdown>
      </div>

      <div className="space-y-2">
        {data.options.map((option, i) => {
          let style = "border";
          if (result && i === result.correctIndex) style = "border-green-600 bg-green-50";
          else if (result && i === result.selected) style = "border-destructive bg-red-50";

          return (
            <label key={i} className={`flex items-start gap-3 rounded-md p-3 cursor-pointer ${style}`}>
              <input
                type="radio"
                name={`question-${index}`}
                checked={selected === i}
                onChange={() => onSelect(i)}
                disabled={!!result}
                className="mt-1"
              />
              <span className="flex-1 min-w-0 break-words">{option}</span>
              {result && i === result.correctIndex && (
                <span className="text-xs font-medium text-green-700">Correct answer</span>
              )}
            </label>
          );
        })}
      </div>

      {result && (
        <p className="text-sm">
          <span className={result.correct ? "font-medium text-green-700" : "font-medium text-destructive"}>
            {result.correct ? "✓ Correct. " : "✗ Incorrect. "}
          </span>
          {result.explanation}
        </p>
      )}
    </fieldset>
  );
}

export default QuizQuestion;