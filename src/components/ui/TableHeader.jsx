export function TableHeader({ children, className = "" }) {
    return (
      <thead className={className}>
        {children}
      </thead>
    );
  }
  