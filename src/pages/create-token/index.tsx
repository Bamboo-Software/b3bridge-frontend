import React, { useState } from 'react';
import FormCreateToken from './create/FormCreateToken';
import ConfirmCreateToken from './create/ConfirmCreateToken';
import SuccessCreateToken from './create/SuccessCreateToken';


const CreateTokenPage: React.FC = () => {
  const [current, setCurrent] = useState(0);
  
  const next = () => {
    setCurrent(current + 1);
  };
  const steps = [
    {
      title: 'First',
      content: <FormCreateToken next={next} />,
    },
    {
      title: 'Second',
      content: <ConfirmCreateToken next={next} />,
    },
    {
      title: 'Last',
      content: <SuccessCreateToken next={next}/>,
    },
  ];



  return (
    <>
      <div>{steps[current].content}</div>
    </>
  );
};

export default CreateTokenPage;