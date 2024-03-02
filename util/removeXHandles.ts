export const removeXHandles = (text: string) => {
  // Regular expression to match Twitter handles: starts with @ and followed by alphanumeric characters or underscores
  const handleRegex = /@\w+/g;
  return text.replace(handleRegex, "").trim();
};
