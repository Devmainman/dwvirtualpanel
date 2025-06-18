export function Table({ children, className = "" }) {
    return (
      <table className={`w-full text-sm text-left ${className}`}>
        {children}
      </table>
    );
  }
  