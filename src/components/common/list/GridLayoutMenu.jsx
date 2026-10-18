import { useState } from "react";
import {
  Button, Menu, MenuItem, ListItemText, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Tooltip
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import StarIcon from "@mui/icons-material/Star"; //  آیکون ستاره برای پیش‌فرض
import StarBorderIcon from "@mui/icons-material/StarBorder"; //  آیکون ستاره توخالی

const GridLayoutMenu = ({ layouts, onApply, onSave, onDelete, onReset, defaultLayoutName, setDefaultLayout }) => {
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
        startIcon={<DashboardCustomizeIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem dir="rtl" onClick={() => { onReset(); closeMenu(); }}>
          <ListItemText primary="پیش‌فرض اولیه سیستم" />
        </MenuItem>

        <Divider />

        {layouts.map((layout) => {
          const isDefault = defaultLayoutName === layout.name; // بررسی اینکه آیا این مدل پیش‌فرضِ کاربر است یا نه

          return (
            <MenuItem
              key={layout.name}
              dir="rtl"
              sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
              onClick={() => { onApply(layout.name); closeMenu(); }}
            >
              <ListItemText 
                primary={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {layout.name}
                    {isDefault && <span style={{ fontSize: '10px', color: '#1976d2', fontWeight: 'bold' }}>(پیش‌فرض)</span>}
                  </Box>
                } 
              />

              {/* ➕ دکمه تنظیم به عنوان پیش‌فرض */}
              <Tooltip title={isDefault ? "مدل پیش‌فرض فعلی" : "تنظیم به عنوان پیش‌فرضِ لود صفحه"}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDefaultLayout(layout.name);
                  }}
                >
                  {isDefault ? <StarIcon fontSize="small" color="primary" /> : <StarBorderIcon fontSize="small" />}
                </IconButton>
              </Tooltip>

              {/* دکمه حذف مدل */}
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onDelete(layout.name); }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </MenuItem>
          );
        })}

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