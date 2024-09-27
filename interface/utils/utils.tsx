interface InputProps {
    label: string;
    id: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    required?: boolean;
  }
  
  const TextInput: React.FC<InputProps> = ({ label, id, ...props }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}:</label>
      <input 
        type="text" 
        id={id} 
        {...props} 
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" 
      />
    </div>
  );
  
  const TextArea: React.FC<InputProps> = ({ label, id, ...props }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}:</label>
      <textarea 
        id={id} 
        {...props} 
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" 
      />
    </div>
  );
  
  const NumberInput: React.FC<InputProps> = ({ label, id, ...props }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}:</label>
      <input 
        type="number" 
        id={id} 
        {...props} 
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" 
      />
    </div>
  );
  
  interface SelectInputProps extends InputProps {
    options: { value: string; label: string }[];
  }
  