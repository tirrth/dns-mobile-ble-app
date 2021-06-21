import React, {useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import RangeSlider from './rn-range-slider';
import Label from './Label';
import Notch from './Notch';
import Rail from './Rail';
import RailSelected from './RailSelected';
import Thumb from './Thumb';

const PriceRangeSlider = props => {
  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);
  const renderLabel = useCallback(value => <Label text={value} />, []);
  const renderNotch = useCallback(() => <Notch />, []);
  const handleValueChange = useCallback((low, high) => {
    props.setLow && props.setLow(low);
    props.setHigh && props.setHigh(high);
  }, []);

  return (
    <View>
      <RangeSlider
        disableRange={!!props.disableRange}
        style={{marginTop: 12}}
        min={props.min}
        max={props.max}
        step={props.step || 1}
        renderThumb={renderThumb}
        renderRail={renderRail}
        renderRailSelected={renderRailSelected}
        renderLabel={!props.disableLabel ? renderLabel : () => null}
        renderNotch={!props.disableNotch ? renderNotch : () => null}
        onValueChanged={handleValueChange}
        low={props.low}
        high={props.high}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default PriceRangeSlider;
