import { Collapse, Checkbox } from "antd";
import React, { useState } from "react";

const { Panel } = Collapse;

function CheckBox(props) {
  const [Checked, setChecked] = useState([]);

  const handleToggle = (value) => {
    console.log(value);
    // 누른 것의 Index를 구하고
    const currentIndex = Checked.indexOf(value);
    console.log(currentIndex);
    // 전체 Checked된 State에서 현재 누른 Checkbox가 이미 있다면
    const newChecked = [...Checked];

    // State 넣어준다.
    if (currentIndex === -1) {
      newChecked.push(value);
      // 빼주고
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
    // 체크 박스를 클릭 하면 이 부분을 통해서 체크된 것들의 정보가 부모 컴포넌트로 업데이트 된다.
    props.handleFilters(newChecked);
  };

  const renderCheckboxLists = () =>
    props.list &&
    props.list.map((value, index) => (
      <React.Fragment key={index}>
        <Checkbox
          onChange={() => handleToggle(value._id)}
          checked={Checked.indexOf(value._id) === -1 ? false : true}
        />
        <span>{value.name}</span>
      </React.Fragment>
    ));

  return (
    <div>
      <Collapse defaultActiveKey={["0"]}>
        <Panel header="Continents" key="1">
          {renderCheckboxLists()}
        </Panel>
      </Collapse>
    </div>
  );
}

export default CheckBox;
