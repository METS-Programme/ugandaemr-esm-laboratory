import React from "react";
import WorkList from "../work-list/work-list.component";

const WorkListComponent = () => {
  return (
    <div>
      <WorkList fulfillerStatus={"IN_PROGRESS"} />
    </div>
  );
};

export default WorkListComponent;
