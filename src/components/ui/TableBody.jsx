export function TableBody({ children, className = "" }) {
    return (
      <tbody className={className}>
        {children}
      </tbody>
    );
  }
  