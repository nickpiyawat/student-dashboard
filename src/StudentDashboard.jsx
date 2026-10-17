import React, { useState, useEffect } from 'react';
import './App.css'; 

// ==========================================
// 1. Component ย่อย: TaskItem (การ์ดแสดงงาน 1 ชิ้น)
// ==========================================
// แยกส่วนนี้ออกมาเพื่อให้โค้ดหลักดูสะอาดตา และสามารถนำไปใช้ซ้ำได้ง่าย
// รับ Props (ข้อมูลและฟังก์ชัน) มาจาก Component แม่ (StudentDashboard)
const TaskItem = ({ task, toggleTask, requestHelp }) => {
  return (
    // หาก task.completed เป็น true ให้เพิ่มคลาส 'is-completed' เพื่อเปลี่ยนสีพื้นหลังให้ดูจางลง
    <div className={`task-item ${task.completed ? 'is-completed' : ''}`}>
      <div className="task-content">
        <label className="task-label">
          {/* Checkbox สำหรับติ๊กเปลี่ยนสถานะงาน */}
          <input 
            type="checkbox" 
            checked={task.completed} 
            onChange={() => toggleTask(task.id)} // เมื่อคลิก จะส่ง id กลับไปให้ฟังก์ชันแม่ทำงาน
            className="task-checkbox"
            
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* ชื่องาน: หากทำเสร็จแล้ว จะมีคลาส is-completed เพื่อขีดฆ่าข้อความ */}
            <span className={`task-text ${task.completed ? 'is-completed' : 'is-active'}`}>
              {task.title}
            </span>
          </div>
        </label>
        
        {/* ส่วนแสดงข้อความขอความช่วยเหลือ (จะแสดงก็ต่อเมื่อ helpRequested เป็น true) */}
        {task.helpRequested && (
          <div className="help-message-box">
            💬 <b>เรื่องที่ขอให้ช่วย:</b> {task.helpMessage}
          </div>
        )}
      </div>
      
      <div className="btn-group">
        {/* ปุ่มขอความช่วยเหลือ */}
        <button 
          onClick={() => requestHelp(task.id)} // ส่ง id กลับไปให้ฟังก์ชันขอความช่วยเหลือที่ Component แม่
          disabled={task.completed} // ปุ่มจะถูก Disable (กดไม่ได้) ทันทีที่งานนั้นติ๊กถูกว่าเสร็จแล้ว
          className={`btn-help ${task.helpRequested ? 'is-requested' : ''}`}
        >
          {/* เปลี่ยนข้อความบนปุ่มตามสถานะการขอความช่วยเหลือ */}
          {task.helpRequested ? 'ยกเลิกคำขอ' : 'ขอความช่วยเหลือ'}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// ข้อมูลเริ่มต้น (Mock Data)
// ==========================================
// ใช้สำหรับกรณีที่ผู้ใช้เพิ่งเปิดเว็บครั้งแรกและยังไม่มีข้อมูลบันทึกในเครื่อง
const initialTasks = [
  { id: 1, title: 'อัปเดตข้อมูลในเรซูเม่ (Resume)', completed: false, helpRequested: false, helpMessage: '' },
  { id: 2, title: 'รวบรวมผลงานลงพอร์ตโฟลิโอ (Portfolio)', completed: false, helpRequested: false, helpMessage: '' },
  { id: 3, title: 'เตรียมเอกสารสำคัญ (Transcript, สำเนาบัตร, รูปถ่าย)', completed: false, helpRequested: false, helpMessage: '' },
  { id: 4, title: 'ซ้อมแนะนำตัวสำหรับการสัมภาษณ์ (Mock Interview)', completed: false, helpRequested: false, helpMessage: '' }
];

// ==========================================
// 2. Component หลัก: StudentDashboard
// ==========================================
export default function StudentDashboard() {
  // --- การจัดการ State (ข้อมูลที่มีการเปลี่ยนแปลงบนหน้าจอ) ---

  // 1. State ของรายการงาน (tasks): ใช้ Lazy Initialization (ใส่ฟังก์ชันเข้าไปใน useState) 
  // เพื่อให้ระบบเช็ก localStorage แค่ครั้งเดียวตอนโหลดเว็บครั้งแรก
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('studentTasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      // กรองเอาเฉพาะงานที่มี id ตรงกับงานหลัก ป้องกันบั๊กจากข้อมูลเก่า
      return parsedTasks.filter(t => [1, 2, 3, 4].includes(t.id));
    }
    return initialTasks; // ถ้าไม่มีข้อมูลเก่า ให้ใช้ค่าเริ่มต้น
  });

  // 2. State สำหรับเก็บข้อความ Error สีแดง (เช่น เวลากดปุ่มผิดเงื่อนไข)
  const [errorMessage, setErrorMessage] = useState('');
  
  // 3. State สำหรับระบบแบ่งหน้า (Tabs): ค่าเริ่มต้นคือ 'all' (แสดงงานทั้งหมด)
  const [activeTab, setActiveTab] = useState('all');

  // 4. State สำหรับโหมดมืด (Dark Mode): เช็กจาก localStorage ว่าผู้ใช้เคยเปิดทิ้งไว้ไหม
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('themeMode') === 'dark';
  });

  // --- การจัดการ Effect (การทำงานอัตโนมัติเมื่อ State เปลี่ยน) ---

  // Effect 1: บันทึกข้อมูลงานลง localStorage ทุกครั้งที่ตัวแปร tasks มีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem('studentTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Effect 2: เปลี่ยนสีพื้นหลังของทั้งหน้าต่างเบราว์เซอร์ (body) ตามโหมดมืด/สว่าง
  useEffect(() => {
    if (isDarkMode) {
      document.body.style.backgroundColor = '#111827'; 
      localStorage.setItem('themeMode', 'dark'); // จำค่าไว้ใช้ตอนรีเฟรช
    } else {
      document.body.style.backgroundColor = '#f8f9fa'; 
      localStorage.setItem('themeMode', 'light');
    }
  }, [isDarkMode]);

  // --- ฟังก์ชันการทำงาน (Handlers) ---

  // ฟังก์ชันสลับสถานะ "ทำเสร็จแล้ว" (ทำงานเมื่อผู้ใช้กด Checkbox)
const toggleTask = (taskId) => {
    // หาข้อมูลของงานที่ถูกคลิก
    const taskToToggle = tasks.find(t => t.id === taskId);

    // ดักจับ: ถ้ากำลังขอความช่วยเหลืออยู่ ไม่อนุญาตให้ติ๊กถูก
    if (taskToToggle.helpRequested) {
      setErrorMessage('ไม่สามารถเปลี่ยนสถานะได้ เนื่องจากรายการนี้กำลังรอความช่วยเหลืออยู่');
      setTimeout(() => setErrorMessage(''), 3000); // ให้ข้อความหายไปเองใน 3 วินาที
      return; 
    }

    setErrorMessage(''); 
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { 
          ...task, 
          completed: !task.completed, 
          helpRequested: !task.completed ? false : task.helpRequested,
          helpMessage: !task.completed ? '' : task.helpMessage
        };
      }
      return task;
    }));
  };    

  // ฟังก์ชันจัดการการขอความช่วยเหลือ
  const requestHelp = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    
    // ดักจับ: ถอดใจกดปุ่มมาด้วยวิธีใดๆ หากงานเสร็จแล้วห้ามขอความช่วยเหลือเด็ดขาด
    if (task.completed) {
      setErrorMessage(`ไม่สามารถขอความช่วยเหลือได้ เนื่องจากงานนี้เสร็จสมบูรณ์แล้ว`);
      return;
    }

    // กรณีเคยกดขอไปแล้ว (ผู้ใช้ต้องการ "ยกเลิกคำขอ")
    if (task.helpRequested) {
      const isConfirmCancel = window.confirm(`คุณต้องการยกเลิกคำขอความช่วยเหลือสำหรับงาน:\n"${task.title}"\nใช่หรือไม่?`);
      if (isConfirmCancel) {
        setErrorMessage('');
        // เปลี่ยนสถานะ helpRequested กลับเป็น false และล้างข้อความทิ้ง
        setTasks(tasks.map(t => t.id === taskId ? { ...t, helpRequested: false, helpMessage: '' } : t));
      }
      return; // จบการทำงานฟังก์ชัน
    }

    // กรณีขอความช่วยเหลือใหม่: แสดง Popup (prompt) ให้ผู้ใช้พิมพ์ข้อความ
    const message = window.prompt(`ระบุสิ่งที่คุณต้องการให้เราช่วยเหลือสำหรับงาน:\n"${task.title}"`);
    // หากผู้ใช้กดยกเลิก หรือปล่อยว่าง ไม่ต้องทำอะไร
    if (message === null || message.trim() === '') return; 

    // บันทึกข้อความและเปลี่ยนสถานะเป็น "ส่งคำขอแล้ว" (helpRequested = true)
    setErrorMessage('');
    setTasks(tasks.map(t => t.id === taskId ? { ...t, helpRequested: true, helpMessage: message.trim() } : t));
  };

  // --- การคำนวณข้อมูลสำหรับแสดงผล (Computed Variables) ---

  // คำนวณเปอร์เซ็นต์ความคืบหน้าสำหรับวาด Progress Bar
  const completedCount = tasks.filter(t => t.completed).length; // หาจำนวนงานที่เสร็จแล้ว
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // การจัดเรียง (Sorting): เอางานที่ทำเสร็จแล้ว ไปแสดงไว้ด้านล่างสุดเสมอ
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;  // a เสร็จ แต่ b ไม่เสร็จ ให้เอา a ไปไว้ล่าง
    if (!a.completed && b.completed) return -1; // a ไม่เสร็จ แต่ b เสร็จ ให้เอา a ขึ้นบน
    return 0; // ถ้าสถานะเหมือนกัน ไม่ต้องสลับตำแหน่ง
  });

  // การกรอง (Filtering): เลือกงานมาแสดงตาม Tab ที่ผู้ใช้กำลังกดอยู่
  const filteredTasks = sortedTasks.filter(task => {
    if (activeTab === 'completed') return task.completed; // ถ้าอยู่หน้า "เสร็จแล้ว" กรองมาเฉพาะที่ completed = true
    return true; // ถ้าอยู่หน้า "ทั้งหมด" (all) ปล่อยผ่านหมดทุกตัว
  });

  // --- ส่วนแสดงผลบนหน้าจอ (UI Rendering) ---
  return (
    // หากเปิด Dark Mode อยู่ ให้ใส่คลาส 'dark-mode' เข้าไปที่ Container หลัก
    <div className={`dashboard-container ${isDarkMode ? 'dark-mode' : ''}`}>
      
      {/* ปุ่มกดสำหรับสลับโหมดสว่าง/มืด วางไว้มุมขวาบน */}
      <button 
        className="theme-toggle-btn" 
        onClick={() => setIsDarkMode(!isDarkMode)} // สลับค่า true/false
        title="สลับโหมดสว่าง/มืด"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <h2 className="dashboard-title">แผนการเตรียมตัวหางาน</h2>
      
      {/* กล่อง Progress Bar */}
      <div className="progress-bg">
        <div 
          // หากครบ 100% จะมีคลาส 'completed' ซึ่งอาจมีแอนิเมชันพิเศษ (ขึ้นอยู่กับ CSS)
          className={`progress-fill ${progressPercent === 100 ? 'completed' : 'in-progress'}`}
          // กำหนดความกว้างแบบไดนามิกตามเปอร์เซ็นต์ที่คำนวณได้
          style={{ width: `${progressPercent}%` }} 
        />
      </div>
      <p className="progress-text">
        ความคืบหน้า {progressPercent}% {progressPercent === 100 && tasks.length > 0 && '🎉 พร้อมแล้ว!'}
      </p>

      {/* กล่องแจ้งเตือน (Alert Box) แสดงผลเมื่อมีข้อความ Error เท่านั้น */}
      {errorMessage && <div className="alert-box">⚠️ {errorMessage}</div>}

      {/* เมนูนำทาง (Tabs) */}
      <div className="tabs-container">
        <button 
          onClick={() => setActiveTab('all')} 
          // ไฮไลต์ปุ่ม (ใส่คลาส active) หาก State ปัจจุบันตรงกับปุ่มนี้
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
        >
          ทั้งหมด
        </button>
        <button 
          onClick={() => setActiveTab('completed')} 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
        >
          เสร็จแล้ว
        </button>
      </div>

      {/* ส่วนแสดงรายการงาน */}
      <div className="task-list">
        {/* หากในหมวดหมู่นั้นไม่มีงานเลย (เช่น กดมาหน้า "เสร็จแล้ว" แต่ยังไม่มีงานที่ทำเสร็จ) */}
        {filteredTasks.length === 0 && (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '30px 0', fontSize: '14px' }}>
            ยังไม่มีรายการที่ทำเสร็จ
          </p>
        )}
        
        {/* นำ Array งานที่ผ่านการจัดเรียงและกรองแล้ว มาลูป (map) เพื่อสร้าง Component <TaskItem /> ทีละชิ้น */}
        {filteredTasks.map((task) => (
          <TaskItem 
            key={task.id} // กฎของ React ต้องมี key เสมอเวลาลูปข้อมูล
            task={task} // ส่งข้อมูลงานชิ้นนี้ไปให้ลูก
            toggleTask={toggleTask} // ส่งฟังก์ชันไปให้ลูกเรียกใช้เมื่อกด Checkbox
            requestHelp={requestHelp} // ส่งฟังก์ชันไปให้ลูกเรียกใช้เมื่อกดปุ่มขอความช่วยเหลือ
          />
        ))}
      </div>
    </div>
  );
}