module.exports = {
  'frontend/src/**/*.{js,jsx}': 'frontend/node_modules/.bin/prettier --write',
  '**/*.java': () =>
    'mvn -q -B -ntp com.diffplug.spotless:spotless-maven-plugin:2.43.0:apply -pl shared,orders-service,payment-service,stock-service',
};
