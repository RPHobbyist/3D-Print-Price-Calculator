import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";

interface FormFieldProps {
  label: string;
  required?: boolean;
  highlight?: boolean;
  children: React.ReactNode;
}

export const FormFieldRow = memo(({ label, required, highlight, children }: FormFieldProps) => (
  <TableRow className={`hover:bg-muted/30 transition-colors ${highlight ? 'bg-accent/5' : ''}`}>
    <TableCell className="font-medium">
      {label} {required && <span className="text-destructive">*</span>}
    </TableCell>
    <TableCell>{children}</TableCell>
  </TableRow>
));

FormFieldRow.displayName = "FormFieldRow";

interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  step?: string;
}

export const TextField = memo(({ value, onChange, placeholder, type = "text", step }: TextFieldProps) => (
  <Input
    type={type}
    step={step}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="bg-background border-input focus:ring-2 focus:ring-primary/20"
  />
));

TextField.displayName = "TextField";

interface SelectOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: SelectOption[];
}

export const SelectField = memo(({ value, onChange, placeholder, options }: SelectFieldProps) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="bg-background">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent className="bg-popover border-border z-50">
      {options.map((option) => (
        <SelectItem key={option.id} value={option.id}>
          {option.label}
          {option.sublabel && <span className="text-muted-foreground ml-1">({option.sublabel})</span>}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
));

SelectField.displayName = "SelectField";
