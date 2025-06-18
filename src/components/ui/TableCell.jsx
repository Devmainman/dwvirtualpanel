export function TableCell({ children, className = "", ...props }) {
    return (
      <td className={`px-4 py-3 ${className}`} {...props}>
        {children}
      </td>
    );
  }
  