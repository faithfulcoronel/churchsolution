import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cortanatechsolutions.stewardtrack',
  appName: 'StewardTrack',
  webDir: 'dist',
  server: {
    url: "https://stewardtrack.com",  
    cleartext: false
  },
  android: {
    allowMixedContent: true
  }
}

export default config;
