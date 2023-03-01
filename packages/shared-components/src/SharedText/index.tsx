import React from 'react';
import {Text, TextProps} from 'react-native';
import {styles} from './style';

export const SharedText = (props: TextProps) => {
  const {style, ...otherProps} = props;
  return <Text {...otherProps} style={[style, styles.sharedText]} />
}
