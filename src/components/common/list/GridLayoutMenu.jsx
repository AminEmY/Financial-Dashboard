import { useState } from "react";
import {
  Button, Menu, MenuItem, ListItemText, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";

const GridLayoutMenu = ({ layouts, onApply, onSave, onDelete, onReset }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");

  const closeMenu = () => setAnchorEl(null);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name);
    setName("");
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        size="small"
        startIcon={<DashboardCustomizeIcon  />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
      
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem dir="rtl" onClick={() => { onReset(); closeMenu(); }}>
          <ListItemText primary="پیش‌فرض" />
        </MenuItem>

        {layouts.map((layout) => (
          <MenuItem
            key={layout.name}
            dir="rtl"
            onClick={() => { onApply(layout.name); closeMenu(); }}
          >
            <ListItemText primary={layout.name} />
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(layout.name); }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </MenuItem>
        ))}

        <Divider />
        <MenuItem dir="rtl" onClick={() => { closeMenu(); setDialogOpen(true); }}>
          <ListItemText primary=" ذخیره ستون ها " />
        </MenuItem>
      </Menu>

      <Dialog dir="rtl" open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>نام مدل</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={handleSave} disabled={!name.trim()}>
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GridLayoutMenu;