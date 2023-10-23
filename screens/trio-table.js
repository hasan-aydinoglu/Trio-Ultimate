import { Table, TableWrapper, Row, Rows, Col, Cell } from 'react-native-table-component';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import NumberButton from './number-button';


const TrioTable = (props) => {

    const {tableData} = props;

    const colors = ["purple", "yellow", "skyblue", "orange", "yellow", "purple", "yellow", "orange", "purple", "pink",
        "green", "yellow", "orange", "skyblue", "pink", "green", "yellow", "orange", "skyblue", "pink",
        "green", "yellow", "orange", "skyblue", "pink", "green", "yellow", "orange", "skyblue", "pink",
        "green", "yellow", "orange", "skyblue", "pink", "green", "yellow", "orange", "skyblue", "pink",
        "purple", "yellow", "orange", "skyblue", "pink", "green", "yellow", "orange", "skyblue"];

    const numberButton = (number, color) => {
        return (
            <NumberButton number={number} color={color} />
        )
    };

    let counter = 0;
    return (
        <View style={styles.container}>
            <Table>
                <Row />
                {
                    tableData.map((rowData, index) => (
                        <TableWrapper key={index} style={styles.row}>
                            {
                                rowData.map((cellData, cellIndex) => (
                                    <Cell key={cellIndex} data={numberButton(cellData, colors[counter++])} />
                                ))
                            }
                        </TableWrapper>
                    ))
                }
            </Table>
        </View>
    )
};


const styles = StyleSheet.create({
    container: { marginTop: 60 },
    head: { height: 20, backgroundColor: 'black' },
    text: { margin: 6 },
    row: { flexDirection: 'row' },
    btnText: { textAlign: 'center', color: '#fff' }
});

export default TrioTable;