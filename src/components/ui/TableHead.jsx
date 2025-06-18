export function TableHead({ children, className = "", ...props }) {
    return (
      <th scope="col" className={`px-4 py-3 font-medium ${className}`} {...props}>
        {children}
      </th>
    );
  }
  