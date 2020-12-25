import * as React from 'react'
import { connect } from 'react-redux'

import pups from '@pups/js'
import { RootState } from '&types/state'
import executor from '@redux-store/executor'
import TimelineClass from '@genbs/urpflanze/dist/services/timeline/Timeline'

import Icon from '@components/icons/Icon'
import Bar from '@window/workspace/timeline/Bar'
import Select from '@components/input/Select'
import Tooltip from '@components/Tooltip'
import { IProjectSequence } from '@genbs/urpflanze/dist/services/types/exporters-importers'

interface SequenceState {
	current_frame: number
	current_time: number
	fps: number
}

interface TimelineProps {
	sequence: IProjectSequence
	bEnableMoveBar: boolean
	bTimelineStarted: boolean
}

const Timeline: React.FunctionComponent<TimelineProps> = ({
	sequence,
	bEnableMoveBar,
	bTimelineStarted,
}: TimelineProps) => {
	const DURATES = new Array(15).fill(0).map((v, i) => ({ key: i + 1 + 's', value: i + 1 }))
	// const FRAMERATES = [15, 30, 60, 120].map((v) => ({ key: v, value: v }))

	const [sequenceState, setSequenceState] = React.useState<SequenceState>({
		current_frame: 0,
		current_time: 0,
		fps: sequence.framerate,
	})
	const [renderedFrames, setRenderedFrames] = React.useState<Array<number>>([])
	const [bRealTime, setRealTime] = React.useState<boolean>(false)

	React.useEffect(() => {
		executor.attach('timeline:progress', data => {
			setSequenceState(data as SequenceState)
		})

		// const itv = setInterval(async () => {
		// 	const _renderedFrames = await executor.ask('get-rendered-frames')

		// 	setRenderedFrames(_renderedFrames)
		// }, 500)

		return () => {
			// clearInterval(itv)
		}
	}, [])

	React.useEffect(() => {
		const setbRealTime = () => !bRealTime && setRealTime(true)
		const unsetsetbRealTime = () => bRealTime && setRealTime(false)

		executor.attach('drawer-canvas:buffer_loaded', setbRealTime)
		executor.attach('drawer-canvas:buffer_flush', unsetsetbRealTime)

		return () => {
			executor.detach('drawer-canvas:buffer_loaded', setbRealTime)
			executor.detach('drawer-canvas:buffer_flush', unsetsetbRealTime)
		}
	}, [bRealTime])

	const slow = Math.round((sequence.framerate / (sequenceState.fps || 1)) * 100) / 100
	return (
		<section data-name="timeline" style={TimelineContainerStyle}>
			<div style={{ position: 'absolute', left: pups.ms(0), top: pups.ms(0), display: 'flex' }}>
				{bRealTime || slow === 1 ? 'realtime' : `${slow}x slow`}
			</div>
			<div style={{ display: 'flex', justifyContent: 'center', marginBottom: pups.ms(0) }}>
				<Icon name="sequence-start" onClick={() => executor.ask('set-timeline', 0)} />
				<Icon
					name={bTimelineStarted ? 'pause' : 'play'}
					onClick={() =>
						executor.ask('change-timeline-state', bTimelineStarted ? TimelineClass.PAUSE : TimelineClass.START)
					}
				/>
				<Icon name="sequence-end" onClick={() => executor.ask('set-timeline', sequence.durate)} />
			</div>

			<div style={{ position: 'absolute', right: pups.ms(0), top: pups.ms(0), display: 'flex' }}>
				<Tooltip title="Durate">
					<Icon name="time" />
				</Tooltip>
				<Select
					position="top"
					options={DURATES}
					value={sequence.durate / 1000}
					placeholder="durate"
					onChange={v => executor.ask('set-timeline-duration', v * 1000)}
				/>
				{/* <Tooltip title="FPS">
                    <Icon name="time" />
                </Tooltip>
                <Select position="top" options={FRAMERATES} value={sequence.framerate} placeholder="framerate" onChange={(v) => executor.ask('set-timeline-framerate', v)} /> */}
			</div>

			<Bar
				enableMoveTime={bEnableMoveBar}
				sequence_framerate={sequence.framerate}
				sequence_durate={sequence.durate}
				current_time={sequenceState.current_time}
				onChange={t => executor.ask('set-timeline', t)}
				renderedFrames={renderedFrames}
				steps={12}
			/>
		</section>
	)
}

const TimelineContainerStyle: React.CSSProperties = {
	position: 'relative',
	padding: `${pups.ms(0)} ${pups.ms(1)}`,
	width: '100%',
	fontSize: '.8rem',
	border: `1px solid ${pups.color('dark-lighten')}`,
	borderBottomWidth: 0,
	borderRadius: '2px 0 0 2px',
	transform: '',
}

export default React.memo(
	connect((state: RootState) => ({
		sequence: state.project.sequence,
		bEnableMoveBar: state.project.clear || (typeof state.project.ghosts !== undefined && state.project.ghosts > 0),
		ghosts: state.project.ghosts,
		bTimelineStarted: state.app.bTimelineStarted,
	}))(Timeline)
)
