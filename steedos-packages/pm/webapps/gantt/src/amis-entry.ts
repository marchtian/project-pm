import './amis-renderer.css';
import { GanttChart } from './components/GanttChart';

declare global {
  // eslint-disable-next-line no-var
  var amisRequire: (mod: string) => any;
}

function register() {
  if (typeof amisRequire === 'undefined') {
    console.error('[pm-gantt] amisRequire is not defined. Load amis SDK first.');
    return;
  }
  const React = amisRequire('react');
  const amisLib = amisRequire('amis');
  if (!amisLib?.Renderer) {
    console.error('[pm-gantt] amis.Renderer not found.');
    return;
  }

  function PmGantt(props: any) {
    const { $schema, data } = props;
    const projectId = $schema.projectId
      ? typeof $schema.projectId === 'string' && $schema.projectId.startsWith('${')
        ? data?.[$schema.projectId.slice(2, -1)]
        : $schema.projectId
      : data?._id;
    const readOnly = !!$schema.readOnly;
    return React.createElement(GanttChart, {
      projectId,
      readOnly,
      className: 'pm-gantt',
    });
  }

  amisLib.Renderer({ type: 'pm-gantt', autoVar: true })(PmGantt);
  console.log('[pm-gantt] amis Renderer registered.');
}

register();
