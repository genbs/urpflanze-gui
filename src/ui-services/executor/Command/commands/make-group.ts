import Executor from '@executor/Executor'

import { ICommandEffects } from '&types/command'
import Command from '@executor/Command/Command'
import SceneChild from '@genbs/urpflanze/dist/core/SceneChild'

import SceneUtilities from '@genbs/urpflanze/dist/services/scene-utilities/SceneUtilities'

interface ICommandMakeGroup {
	ids: Array<string | number>

	sceneChilds: Array<SceneChild>

	parent_id?: string | number | null
	new_shape_id?: string | number
}

class MakeGroup extends Command {
	slug = 'make-shape'
	passive = false
	data: ICommandMakeGroup

	effects: ICommandEffects = {
		scene_update: true,
		scene_layers_update: true,
		select_layer: [],
	}

	constructor(id: number, args: Array<number | string>, preventPushToHistory = false, executor: Executor) {
		super(id, args, preventPushToHistory, executor)

		this.data = {
			ids: args,
			sceneChilds: args.map(id => executor.getScene().find(id)).filter(e => !!e) as Array<SceneChild>,
		}
	}

	private hasSameParents(sceneChilds: Array<SceneChild>): boolean {
		if (sceneChilds.length <= 1) return true

		const parents = sceneChilds.map(sceneChild => SceneUtilities.getParent(sceneChild))
		let prevParent = parents[0]

		for (let i = 1, len = parents.length; i < len; i++) {
			if (prevParent != parents[i]) return false
			prevParent = parents[i]
		}

		return true
	}

	protected handleRedo(executor: Executor): boolean | undefined {
		const scene = executor.getScene()
		const drawer = executor.getDrawer()

		if (this.data.sceneChilds.length > 0 && this.hasSameParents(this.data.sceneChilds)) {
			const sceneChilds = this.data.sceneChilds
			const parent = SceneUtilities.getParent(sceneChilds[0])

			const shape = SceneUtilities.create(
				'Shape',
				{
					id: this.data.new_shape_id,
				},
				scene,
				drawer
			) as SceneChild

			sceneChilds.forEach(sceneChild => {
				SceneUtilities.remove(sceneChild)
				SceneUtilities.add(shape, sceneChild, undefined, scene)
			})

			if (parent) SceneUtilities.add(parent, shape)
			else executor.getScene().add(shape)

			this.data.parent_id = parent ? parent.id : null
			this.data.new_shape_id = shape.id

			this.effects.select_layer = [this.data.new_shape_id]
			return true
		}
	}

	protected handleUndo(executor: Executor): boolean | undefined {
		const scene = executor.getScene()

		if (this.data.sceneChilds.length > 0 && this.data.new_shape_id) {
			scene.removeFromId(this.data.new_shape_id)
			const parent = this.data.parent_id ? scene.find(this.data.parent_id) : null

			if (parent) this.data.sceneChilds.forEach(sceneChild => SceneUtilities.add(parent, sceneChild))
			else this.data.sceneChilds.forEach(sceneChild => scene.add(sceneChild))

			this.effects.select_layer = this.data.sceneChilds.map(sceneChild => sceneChild.id)
			return true
		}
	}

	protected setDescriptor(): void {
		this.descriptor = `make shape`
	}
}

export default MakeGroup
