export interface Props {
  datetime: string | Date;
  size?: "sm" | "lg";
  className?: string;
  readingTime?: string;
}

export default function Datetime({
  datetime,
  size = "sm",
  className,
  readingTime,
}: Props) {
  return (
    <div className={`flex items-center space-x-2 opacity-80 ${className}`}>
      <span className="sr-only">Posted on:</span>
      
        <FormattedDatetime datetime={datetime} />
        <span> ({readingTime})</span> {/* display reading time */}
    </div>
  );
}

const FormattedDatetime = ({ datetime }: { datetime: string | Date }) => {
  const myDatetime = new Date(datetime);

  const date = myDatetime.toLocaleDateString([], {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const time = myDatetime.toLocaleTimeString([], {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>{date}</>
  );
};
