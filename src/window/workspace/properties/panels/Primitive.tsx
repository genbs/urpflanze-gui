import * as React from 'react'

import Panel, { ISceneChildPanel } from '@window/workspace/properties/Panel'
import Prop from '@window/workspace/properties/Prop'
import executor from '@redux-store/executor'
import Tooltip from '@components/Tooltip'
import pups from '@pups/js'

const Primitive: React.FunctionComponent<ISceneChildPanel> = ({ layer }: ISceneChildPanel) => {
	function subdivide() {
		executor.run('subdivide', { id: layer.id })
	}

	return (
		<Panel name="Primitive settings" icon="primitive" expandable={true} expanded={true}>
			<Prop layer={layer} name="sideLength" />

			{layer.shape && (
				<div style={{ textAlign: 'right' }}>
					<div style={{ display: 'inline-block', verticalAlign: 'middle', cursor: 'pointer' }}>
						<Tooltip title="Subdivide buffer" position="left">
							<div onClick={subdivide}>Subdivide</div>
						</Tooltip>
					</div>
				</div>
			)}

			{layer.type === 'RegularPolygon' && <Prop layer={layer} name="sideNumber" />}

			{layer.type === 'Rose' && (
				<React.Fragment>
					<Prop layer={layer} name="n" />
					<Prop layer={layer} name="d" />
				</React.Fragment>
			)}

			{layer.type === 'Lissajous' && (
				<React.Fragment>
					<Prop layer={layer} name="wx" />
					<Prop layer={layer} name="wy" />
					<Prop layer={layer} name="wz" />
				</React.Fragment>
			)}

			{layer.type === 'Spiral' && (
				<React.Fragment>
					<Prop layer={layer} name="twists" />
					<Prop layer={layer} name="twists_start" />

					<div style={{ display: 'flex', gap: pups.ms(0) }}>
						<span>Spiral type</span>
						<div style={{ flex: 1 }}>
							<Prop layer={layer} name="spiral" />
						</div>
					</div>
				</React.Fragment>
			)}

			<div style={{ textAlign: 'right' }}>
				<div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
					<Prop layer={layer} name="bCloseShape" />
				</div>
			</div>
			<Prop layer={layer} name="bAdaptBuffer" />
		</Panel>
	)
}

export default React.memo(Primitive)
