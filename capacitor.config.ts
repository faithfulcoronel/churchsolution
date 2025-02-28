import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cortanatechsolutions.stewardtrack',
  appName: 'StewardTrack',
  webDir: 'build',
  server: {
    url: "https://stewardtrack.com",  
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
}

export default config;
