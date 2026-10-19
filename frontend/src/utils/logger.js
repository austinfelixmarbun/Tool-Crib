/**
 @param {string} action 
 @param {string} toolId 
 @param {string} toolName
 @param {string} field
 @param {any} oldValue
 @param {any} newValue
 @param {string} reason
 */
export const logAudit = (
  action,
  toolId,
  toolName,
  field,
  oldValue,
  newValue,
  reason = "",
) => {
  try {
    const storedLogs = localStorage.getItem("auditLogs");
    const logs = storedLogs ? JSON.parse(storedLogs) : [];

    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      action,
      toolId,
      toolName,
      field,
      oldValue: String(oldValue),
      newValue: String(newValue),
      reason,
      user: "CurrentUser",
    };

    logs.unshift(newLog);
    localStorage.setItem("auditLogs", JSON.stringify(logs));
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
};
