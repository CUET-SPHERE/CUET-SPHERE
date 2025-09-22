import React, { useState } from 'react';
import { HALLS } from '../../utils/validation';
import { Home, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const HallManager = () => {
  const { isDark, colors } = useTheme();
  const [halls, setHalls] = useState(HALLS);
  const [newHall, setNewHall] = useState('');
  const [editing, setEditing] = useState(null); // { index, name }

  const handleAdd = () => {
    if (newHall && !halls.includes(newHall)) {
      setHalls([...halls, newHall]);
      setNewHall('');
    }
  };

  const handleDelete = (index) => {
    setHalls(halls.filter((_, i) => i !== index));
  };

  const handleEdit = () => {
    if (editing && editing.name) {
      const updatedHalls = [...halls];
      updatedHalls[editing.index] = editing.name;
      setHalls(updatedHalls);
      setEditing(null);
    }
  };

  return (
    <div
      className="p-6 rounded-xl shadow-md border"
      style={{
        backgroundColor: isDark ? colors.background.cardDark : colors.background.cardLight,
        borderColor: isDark ? colors.interactive.borderDark : colors.interactive.border
      }}
    >
      <h2
        className="text-xl font-semibold mb-4 flex items-center gap-2"
        style={{ color: isDark ? colors.text.primaryDark : colors.text.primaryLight }}
      >
        <Home style={{ color: colors.status.event.lightText }} />
        Manage Halls
      </h2>

      {/* List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
        {halls.map((name, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: isDark ? colors.status.general.dark : colors.status.general.light }}
          >
            {editing?.index === index ? (
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="bg-transparent w-full focus:outline-none"
                style={{ color: isDark ? colors.text.primaryDark : colors.text.primaryLight }}
              />
            ) : (
              <span
                style={{ color: isDark ? colors.text.primaryDark : colors.text.primaryLight }}
              >
                {name}
              </span>
            )}
            <div className="flex items-center gap-2">
              {editing?.index === index ? (
                <>
                  <button
                    onClick={handleEdit}
                    className="p-1.5 rounded-full transition-colors"
                    style={{
                      color: isDark ? colors.status.success.darkText : colors.status.success.lightText,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = isDark ? colors.status.success.dark : colors.status.success.light;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="p-1.5 rounded-full transition-colors"
                    style={{
                      color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = isDark ? colors.interactive.hoverDark : colors.interactive.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing({ index, name })}
                    className="p-1.5 rounded-full transition-colors"
                    style={{
                      color: colors.primary.blue,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = colors.primary.blueLight;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-1.5 rounded-full transition-colors"
                    style={{
                      color: isDark ? colors.status.error.darkText : colors.status.error.lightText,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = isDark ? colors.status.error.dark : colors.status.error.light;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      <div
        className="mt-6 pt-4 border-t"
        style={{ borderColor: isDark ? colors.interactive.borderDark : colors.interactive.border }}
      >
        <h3
          className="text-md font-semibold mb-2"
          style={{ color: isDark ? colors.text.secondaryDark : colors.text.secondaryLight }}
        >
          Add New Hall
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Hall Name"
            value={newHall}
            onChange={(e) => setNewHall(e.target.value)}
            className="flex-grow p-2 border rounded-lg focus:ring-2 focus:outline-none"
            style={{
              backgroundColor: isDark ? colors.interactive.hoverDark : colors.interactive.hover,
              borderColor: isDark ? colors.interactive.borderDark : colors.interactive.border,
              color: isDark ? colors.text.primaryDark : colors.text.primaryLight,
              focusRingColor: colors.primary.blue,
              focusBorderColor: colors.primary.blue
            }}
          />
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: colors.primary.blue,
              color: colors.text.primaryDark
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.primary.blueHover;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.primary.blue;
            }}
          >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HallManager;
