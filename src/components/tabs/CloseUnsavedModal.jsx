import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import useTabs from "../../context/useTabs";

const CloseUnsavedModal = () => {
  const { tabs, pendingCloseTabId, setPendingCloseTabId, closeTab } = useTabs();
  const targetTab = tabs.find(t => t.id === pendingCloseTabId);

  if (!pendingCloseTabId) return null;

  return (
    <Dialog open={true} onClose={() => setPendingCloseTabId(null)} dir="rtl">
      <DialogTitle>تغییرات ذخیره‌نشده</DialogTitle>
      <DialogContent>
        <Typography>
          اطلاعات سند در تب &quot;{targetTab?.title}&quot; تغییر کرده است. آیا می‌خواهید تغییرات ذخیره شوند؟
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={() => setPendingCloseTabId(null)} color="inherit">
          انصراف
        </Button>
        <Button 
          onClick={() => closeTab(pendingCloseTabId, true)} 
          color="error" 
          variant="outlined"
        >
          بستن بدون ذخیره
        </Button>
        <Button 
          onClick={() => {
            // اگر متد ذخیره از طریق دیتا روی تب پاس داده شده باشد، اینجا صدا زده می‌شود
            if (targetTab?.data?.onSave) {
              targetTab.data.onSave();
            }
            closeTab(pendingCloseTabId, true);
          }} 
          variant="contained" 
          color="primary"
        >
          ذخیره و بستن
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CloseUnsavedModal;