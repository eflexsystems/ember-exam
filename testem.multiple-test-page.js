module.exports = {
  test_page: [
    'tests/index.html?hidepassed&derp=herp',
    'tests/index.html?hidepassed&foo=bar',
  ],
  disable_watching: true,
  launch_in_ci: ['Chrome'],
  launch_in_dev: ['Chrome'],
  browser_args: {
    Chrome: [
      '--disable-gpu',
      '--headless',
      '--remote-debugging-port=9222',
      '--window-size=1440,900',
    ],
  },
  parallel: -1,
};
