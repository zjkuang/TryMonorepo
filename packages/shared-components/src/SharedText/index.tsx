import React from 'react';
import {Text, TextProps} from 'react-native';

export const SharedText = (props: TextProps) => {
  const {style, ...otherProps} = props;
  return <Text {...otherProps} style={[style, {
    borderWidth: 2,
    borderRadius: 4,
    borderColor: 'red',
  }]} />
}
