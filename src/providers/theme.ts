import { createMuiTheme } from '@material-ui/core'

const defaultMuiTheme = createMuiTheme()
export default createMuiTheme({
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '*': {
          'scrollbar-width': 'thin',
        },
        '*::-webkit-scrollbar': { width: 10, height: 10 },
        '::-webkit-scrollbar-thumb': {
          background: defaultMuiTheme.palette.primary.main,
          borderRadius: 10,
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: defaultMuiTheme.palette.primary.dark,
        },
      },
    },
  }
})