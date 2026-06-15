"use client";

import { useEffect, useState } from "react";


export default function Habits() {


  const [habits, setHabits] = useState<any[]>([]);
  const [name, setName] = useState("");



  async function loadHabits() {

    const res = await fetch("/api/habits");

    const data = await res.json();

    if (Array.isArray(data)) {
      setHabits(data);
    }

  }



  useEffect(() => {

    loadHabits();

  }, [])




  async function addHabit() {


    if (!name) return;


    await fetch("/api/habits", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        name
      })

    });


    setName("");

    loadHabits();

  }





  async function completeHabit(id: string) {


    await fetch("/api/habits", {

      method: "PATCH",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        id
      })

    });


    loadHabits();

  }




  return (

    <div className="p-10">


      <h1 className="text-5xl font-bold">
        Habits 🔥
      </h1>



      <div className="mt-8 flex gap-3">


        <input

          className="border p-3 rounded w-80"

          placeholder="New habit..."

          value={name}

          onChange={(e) => setName(e.target.value)}

        />


        <button

          onClick={addHabit}

          className="bg-black text-white px-5 rounded"

        >
          Add
        </button>


      </div>




      <div className="grid gap-5 mt-10">


        {

          habits.map(habit => (


            <div

              key={habit.id}

              className="border rounded-xl p-6 flex justify-between"


            >


              <div>


                <h2 className="text-xl font-bold">

                  {habit.name}

                </h2>


                <p>

                  🔥 Streak: {habit.streak} days

                </p>


              </div>



              <button

                disabled={habit.completedToday}

                onClick={() => completeHabit(habit.id)}

                className="bg-green-600 text-white px-4 rounded"

              >

                {
                  habit.completedToday
                    ?
                    "Done ✅"
                    :
                    "Complete"
                }

              </button>



            </div>


          ))

        }


      </div>



    </div>

  )

}