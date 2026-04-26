// Server type registry system
const serverTypes = {
  teamspeak: {
    name: "TeamSpeak",
    library: "ts3-nodejs-library",
    port: 10011,
    connect: async (config) => {
      // We'll implement this properly later
      console.log('Teamspeak connect function would go here');
      return { connected: true };
    }
  }
};

module.exports = { serverTypes };