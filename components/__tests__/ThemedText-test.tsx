import * as React from 'react';
// eslint-disable-next-line import/no-unresolved
import renderer from 'react-test-renderer';

// eslint-disable-next-line import/no-unresolved
import { ThemedText } from '../RestyleText';

it(`renders correctly`, () => {
  const tree = renderer.create(<ThemedText>Snapshot test!</ThemedText>).toJSON();

  expect(tree).toMatchSnapshot();
});
