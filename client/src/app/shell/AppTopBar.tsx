import { AppBar, Box, Toolbar } from '@mui/material';

import { topBarHeight } from './layout';

export function AppTopBar() {
  // The session contract carries only the user id, so there is no name to build
  // initials from. The account mark stays until the contract supplies a name.
  // const accountLabel = `Signed in as account ${user.id}`;

  return (
    <AppBar
      position="static"
      color="inherit"
      sx={{
        flexShrink: 0,
        backgroundColor: 'background.paper',
        backgroundImage: 'none',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          height: topBarHeight,
          minHeight: topBarHeight,
          px: 2,
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: 0,
          }}
        >
          {/* <Typography variant="body2" color="text.secondary" noWrap>
            {productName}
          </Typography>
          <Typography variant="body2" color="text.disabled" aria-hidden="true">
            /
          </Typography>
          <Typography variant="subtitle2" color="text.primary" noWrap>
            {pageLabel}
          </Typography> */}
        </Box>

        <Box sx={{ marginLeft: 'auto' }}>
          {/* <Tooltip title={accountLabel}>
            <Avatar
              role="img"
              aria-label={accountLabel}
              sx={{
                width: 30,
                height: 30,
                backgroundColor: 'action.hover',
                color: 'text.secondary',
              }}
            >
              <AccountCircleOutlined sx={{ fontSize: 20 }} />
            </Avatar>
          </Tooltip> */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
