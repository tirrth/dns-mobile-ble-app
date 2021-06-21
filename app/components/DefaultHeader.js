import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {IconButton} from 'react-native-paper';
import Svg, {Path, Rect} from 'react-native-svg';

const WaveCurveHeaderBackground = props => {
  return (
    <View style={{transform: [{rotateX: '180deg'}], ...props.style}}>
      <Svg
        height={100}
        width="100%"
        preserveAspectRatio="xMinYMin slice"
        viewBox="0 0 1440 320">
        <Path
          fill="#931C20"
          fill-opacity="1"
          d="M0,32L0,74.7C160,117,320,203,480,202.7C640,203,800,117,960,101.3C1120,85,1280,139,1360,165.3L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        />
      </Svg>
      <Svg height={50} width="100%">
        <Rect x="0" y="0" width="100%" height="100%" fill="#931C20" />
      </Svg>
    </View>
  );
};

export default defaultHeader = props => {
  const canOpenDrawer = props?.navigation?.openDrawer;
  return (
    <View>
      <WaveCurveHeaderBackground style={{zIndex: 100}} />
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          marginTop: -38,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          zIndex: 100,
        }}>
        {canOpenDrawer && (
          <View>
            <IconButton
              size={22}
              icon="menu"
              color="#fff"
              onPress={() => props.navigation.openDrawer()}
            />
          </View>
        )}
        <View style={{marginLeft: 10}}>
          <Text
            style={[
              {
                color: 'white',
                fontSize: 18,
                textAlign: 'center',
                fontWeight: '700',
                letterSpacing: 0.9,
                marginTop: -1.2,
              },
              !canOpenDrawer && {marginLeft: 8},
            ]}>
            {props.title || 'No Title'}
          </Text>
        </View>
      </View>
    </View>
  );
};
