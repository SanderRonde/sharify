import { StatisticsData } from '../../../../../../shared/ws';
import Statistics from './Statistics/Statistics';
import { Modal } from 'antd';
import React from 'react';

class StatisticsModal extends React.Component<
    {
		visible: boolean;
		statistics: StatisticsData;
        onHide: () => void;
    }
> {
    render() {
        return (
            <Modal
                visible={this.props.visible}
                footer={null}
                onCancel={this.props.onHide}
                title="Room statistics"
            >
                <Statistics statistics={this.props.statistics} />
            </Modal>
        );
    }
}

export default StatisticsModal;
