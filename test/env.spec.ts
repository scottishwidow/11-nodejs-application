describe('Environment', () => {
  it('requires APP_VERSION to be set and non-empty', () => {
    expect(process.env.APP_VERSION).toBeTruthy();
  });
});
